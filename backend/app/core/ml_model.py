"""
Sentinel-AI — Pure NumPy BERT-tiny Inference Engine
Loads mrm8488/bert-tiny-finetuned-sms-spam-detection from safetensors
and runs inference without PyTorch (Python 3.13 compatible).
"""

import logging
import numpy as np
from safetensors.numpy import load_file
from transformers import AutoTokenizer
from huggingface_hub import hf_hub_download

logger = logging.getLogger("sentinel.ml")

MODEL_ID = "mrm8488/bert-tiny-finetuned-sms-spam-detection"


def _gelu(x):
    """Approximate GELU activation."""
    return 0.5 * x * (1.0 + np.tanh(np.sqrt(2.0 / np.pi) * (x + 0.044715 * x ** 3)))


def _layer_norm(x, weight, bias, eps=1e-12):
    """Layer normalization."""
    mean = x.mean(axis=-1, keepdims=True)
    var = x.var(axis=-1, keepdims=True)
    return weight * (x - mean) / np.sqrt(var + eps) + bias


def _softmax(x, axis=-1):
    """Numerically stable softmax."""
    e_x = np.exp(x - np.max(x, axis=axis, keepdims=True))
    return e_x / e_x.sum(axis=axis, keepdims=True)


class BertTinyNumpy:
    """
    Pure NumPy implementation of BERT-tiny for text classification.
    2 encoder layers, 128 hidden dim, 2 attention heads.
    """

    def __init__(self, weights: dict, tokenizer):
        self.w = weights
        self.tokenizer = tokenizer
        self.num_heads = 2
        self.head_dim = 64  # 128 / 2
        logger.info("🧬 BertTinyNumpy initialized — 2 layers, 128d, 2 heads")

    def _embed(self, input_ids, token_type_ids):
        """Embedding layer: word + position + token_type."""
        seq_len = input_ids.shape[1]
        word_emb = self.w["bert.embeddings.word_embeddings.weight"][input_ids[0]]
        pos_emb = self.w["bert.embeddings.position_embeddings.weight"][:seq_len]
        type_emb = self.w["bert.embeddings.token_type_embeddings.weight"][token_type_ids[0]]

        emb = word_emb + pos_emb + type_emb
        emb = _layer_norm(
            emb,
            self.w["bert.embeddings.LayerNorm.weight"],
            self.w["bert.embeddings.LayerNorm.bias"],
        )
        return emb[np.newaxis, :]  # (1, seq_len, 128)

    def _attention(self, hidden, layer_idx):
        """Multi-head self-attention for one layer."""
        prefix = f"bert.encoder.layer.{layer_idx}.attention"

        Q = hidden @ self.w[f"{prefix}.self.query.weight"].T + self.w[f"{prefix}.self.query.bias"]
        K = hidden @ self.w[f"{prefix}.self.key.weight"].T + self.w[f"{prefix}.self.key.bias"]
        V = hidden @ self.w[f"{prefix}.self.value.weight"].T + self.w[f"{prefix}.self.value.bias"]

        batch, seq_len, _ = Q.shape
        Q = Q.reshape(batch, seq_len, self.num_heads, self.head_dim).transpose(0, 2, 1, 3)
        K = K.reshape(batch, seq_len, self.num_heads, self.head_dim).transpose(0, 2, 1, 3)
        V = V.reshape(batch, seq_len, self.num_heads, self.head_dim).transpose(0, 2, 1, 3)

        scores = Q @ K.transpose(0, 1, 3, 2) / np.sqrt(self.head_dim)
        attn_weights = _softmax(scores, axis=-1)
        context = (attn_weights @ V).transpose(0, 2, 1, 3).reshape(batch, seq_len, -1)

        # Output projection
        output = context @ self.w[f"{prefix}.output.dense.weight"].T + self.w[f"{prefix}.output.dense.bias"]
        output = _layer_norm(
            output + hidden,
            self.w[f"{prefix}.output.LayerNorm.weight"],
            self.w[f"{prefix}.output.LayerNorm.bias"],
        )
        return output

    def _ffn(self, hidden, layer_idx):
        """Feed-forward network for one layer."""
        prefix = f"bert.encoder.layer.{layer_idx}"
        intermediate = _gelu(
            hidden @ self.w[f"{prefix}.intermediate.dense.weight"].T + self.w[f"{prefix}.intermediate.dense.bias"]
        )
        output = intermediate @ self.w[f"{prefix}.output.dense.weight"].T + self.w[f"{prefix}.output.dense.bias"]
        output = _layer_norm(
            output + hidden,
            self.w[f"{prefix}.output.LayerNorm.weight"],
            self.w[f"{prefix}.output.LayerNorm.bias"],
        )
        return output

    def predict(self, text: str) -> dict:
        """
        Run inference on a text string.

        Returns:
            {"label": "LABEL_0"|"LABEL_1", "score": float}
            LABEL_0 = ham (safe), LABEL_1 = spam (threat)
        """
        tokens = self.tokenizer(
            text[:512],
            return_tensors="np",
            padding=True,
            truncation=True,
            max_length=512,
        )

        input_ids = tokens["input_ids"]
        token_type_ids = tokens.get("token_type_ids", np.zeros_like(input_ids))

        # Forward pass
        hidden = self._embed(input_ids, token_type_ids)

        # 2 encoder layers
        for i in range(2):
            hidden = self._attention(hidden, i)
            hidden = self._ffn(hidden, i)

        # Pooling: take [CLS] token → dense
        cls_token = hidden[:, 0, :]
        pooled = np.tanh(
            cls_token @ self.w["bert.pooler.dense.weight"].T + self.w["bert.pooler.dense.bias"]
        )

        # Classifier head → 2 classes
        logits = pooled @ self.w["classifier.weight"].T + self.w["classifier.bias"]
        probs = _softmax(logits, axis=-1)[0]

        label_idx = int(np.argmax(probs))
        return {
            "label": f"LABEL_{label_idx}",
            "score": float(probs[label_idx]),
        }


def load_bert_tiny():
    """
    Load BERT-tiny model weights and tokenizer from Hugging Face Hub.
    Returns a BertTinyNumpy instance ready for inference.
    """
    logger.info(f"📥 Downloading BERT-tiny weights from {MODEL_ID}...")

    # Download safetensors weights
    weights_path = hf_hub_download(MODEL_ID, filename="model.safetensors")
    weights = load_file(weights_path)
    logger.info(f"   Loaded {len(weights)} weight tensors")

    # Load tokenizer
    tokenizer = AutoTokenizer.from_pretrained(MODEL_ID)
    logger.info(f"   Tokenizer loaded: {type(tokenizer).__name__}")

    model = BertTinyNumpy(weights, tokenizer)
    return model
