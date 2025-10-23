"""
Audio Utilities for Gemini Live API

This module provides reusable functions for audio processing when working with
the Gemini Live API. The API requires:
- Input: 16-bit PCM, 16kHz, mono, little-endian
- Output: 24kHz sample rate

Functions include PCM encoding/decoding, sample rate conversion, base64 handling,
and format conversions for different Python audio libraries.
"""

import base64
import numpy as np
from typing import Union, Tuple
import io


# Audio format constants
INPUT_SAMPLE_RATE = 16000   # Gemini Live API input requirement
OUTPUT_SAMPLE_RATE = 24000  # Gemini Live API output sample rate
CHANNELS = 1                # Mono audio
SAMPLE_WIDTH = 2            # 16-bit = 2 bytes


def float32_to_int16(audio_data: np.ndarray) -> np.ndarray:
    """
    Convert float32 audio data to int16 PCM format.

    Args:
        audio_data: Numpy array of float32 audio samples (typically -1.0 to 1.0)

    Returns:
        Numpy array of int16 PCM samples

    Example:
        >>> float_audio = np.array([0.5, -0.5, 0.0], dtype=np.float32)
        >>> pcm_audio = float32_to_int16(float_audio)
    """
    # Clip values to prevent overflow
    audio_data = np.clip(audio_data, -1.0, 1.0)
    # Scale to int16 range
    return (audio_data * 32767).astype(np.int16)


def int16_to_float32(audio_data: np.ndarray) -> np.ndarray:
    """
    Convert int16 PCM audio data to float32 format.

    Args:
        audio_data: Numpy array of int16 PCM samples

    Returns:
        Numpy array of float32 audio samples (-1.0 to 1.0)

    Example:
        >>> pcm_audio = np.array([16384, -16384, 0], dtype=np.int16)
        >>> float_audio = int16_to_float32(pcm_audio)
    """
    return audio_data.astype(np.float32) / 32768.0


def encode_audio_to_base64(audio_data: np.ndarray) -> str:
    """
    Encode int16 PCM audio data to base64 string for Gemini Live API.

    Args:
        audio_data: Numpy array of int16 PCM samples

    Returns:
        Base64-encoded string of audio bytes

    Example:
        >>> pcm_audio = np.array([100, -100, 200], dtype=np.int16)
        >>> base64_str = encode_audio_to_base64(pcm_audio)
    """
    # Convert to little-endian bytes
    audio_bytes = audio_data.tobytes()
    # Encode to base64
    return base64.b64encode(audio_bytes).decode('utf-8')


def decode_base64_to_audio(base64_str: str) -> np.ndarray:
    """
    Decode base64 string from Gemini Live API to int16 PCM audio data.

    Args:
        base64_str: Base64-encoded audio string from API response

    Returns:
        Numpy array of int16 PCM samples

    Example:
        >>> base64_str = "ZACAAP//"  # Example base64 audio
        >>> pcm_audio = decode_base64_to_audio(base64_str)
    """
    # Decode base64 to bytes
    audio_bytes = base64.b64decode(base64_str)
    # Convert bytes to int16 array (little-endian)
    return np.frombuffer(audio_bytes, dtype=np.int16)


def resample_audio(audio_data: np.ndarray, orig_sr: int, target_sr: int) -> np.ndarray:
    """
    Resample audio data to a different sample rate using linear interpolation.

    For production use, consider using scipy.signal.resample or librosa.resample
    for higher quality resampling.

    Args:
        audio_data: Numpy array of audio samples
        orig_sr: Original sample rate in Hz
        target_sr: Target sample rate in Hz

    Returns:
        Resampled audio array

    Example:
        >>> audio_16k = np.random.randn(16000).astype(np.float32)
        >>> audio_24k = resample_audio(audio_16k, 16000, 24000)
    """
    if orig_sr == target_sr:
        return audio_data

    # Calculate the new length
    duration = len(audio_data) / orig_sr
    new_length = int(duration * target_sr)

    # Use numpy's linear interpolation
    indices = np.linspace(0, len(audio_data) - 1, new_length)
    return np.interp(indices, np.arange(len(audio_data)), audio_data)


def convert_to_gemini_input_format(audio_data: np.ndarray,
                                   current_sr: int = INPUT_SAMPLE_RATE,
                                   input_dtype: str = 'float32') -> str:
    """
    Convert audio data to Gemini Live API input format (base64-encoded 16kHz PCM).

    Args:
        audio_data: Numpy array of audio samples
        current_sr: Current sample rate of the audio data
        input_dtype: Data type of input ('float32' or 'int16')

    Returns:
        Base64-encoded string ready to send to Gemini Live API

    Example:
        >>> # From pyaudio callback (float32)
        >>> float_chunk = np.frombuffer(in_data, dtype=np.float32)
        >>> base64_audio = convert_to_gemini_input_format(float_chunk, 16000, 'float32')

        >>> # From sounddevice (also float32 typically)
        >>> base64_audio = convert_to_gemini_input_format(indata, 16000, 'float32')
    """
    # Resample if needed
    if current_sr != INPUT_SAMPLE_RATE:
        audio_data = resample_audio(audio_data, current_sr, INPUT_SAMPLE_RATE)

    # Convert to int16 if needed
    if input_dtype == 'float32':
        audio_data = float32_to_int16(audio_data)
    elif audio_data.dtype != np.int16:
        audio_data = audio_data.astype(np.int16)

    # Encode to base64
    return encode_audio_to_base64(audio_data)


def convert_from_gemini_output_format(base64_str: str,
                                     output_dtype: str = 'float32',
                                     target_sr: int = OUTPUT_SAMPLE_RATE) -> np.ndarray:
    """
    Convert Gemini Live API output (base64 24kHz PCM) to desired format.

    Args:
        base64_str: Base64-encoded audio from Gemini response
        output_dtype: Desired output data type ('float32' or 'int16')
        target_sr: Target sample rate (default 24000 matches Gemini output)

    Returns:
        Numpy array of audio samples in the desired format

    Example:
        >>> # Get audio from Gemini response
        >>> base64_audio = response.data
        >>> # Convert for playback with pyaudio/sounddevice
        >>> float_audio = convert_from_gemini_output_format(base64_audio, 'float32')
    """
    # Decode base64 to int16 PCM
    audio_data = decode_base64_to_audio(base64_str)

    # Resample if needed
    if target_sr != OUTPUT_SAMPLE_RATE:
        # Convert to float for resampling
        audio_float = int16_to_float32(audio_data)
        audio_float = resample_audio(audio_float, OUTPUT_SAMPLE_RATE, target_sr)

        if output_dtype == 'int16':
            return float32_to_int16(audio_float)
        return audio_float

    # Convert to desired dtype
    if output_dtype == 'float32':
        return int16_to_float32(audio_data)
    return audio_data


def create_audio_chunks(audio_data: np.ndarray, chunk_duration_ms: int = 100) -> list:
    """
    Split audio data into chunks for streaming to Gemini Live API.

    Args:
        audio_data: Numpy array of audio samples (int16)
        chunk_duration_ms: Duration of each chunk in milliseconds

    Returns:
        List of audio chunks (numpy arrays)

    Example:
        >>> audio = np.random.randint(-1000, 1000, 16000, dtype=np.int16)
        >>> chunks = create_audio_chunks(audio, chunk_duration_ms=100)
        >>> for chunk in chunks:
        ...     base64_chunk = encode_audio_to_base64(chunk)
        ...     # Send base64_chunk to API
    """
    chunk_size = int(INPUT_SAMPLE_RATE * chunk_duration_ms / 1000)
    chunks = []

    for i in range(0, len(audio_data), chunk_size):
        chunk = audio_data[i:i + chunk_size]
        chunks.append(chunk)

    return chunks


class AudioBuffer:
    """
    Buffer for managing incoming audio chunks with gap-free playback scheduling.
    Useful for queuing Gemini Live API audio responses.
    """

    def __init__(self, sample_rate: int = OUTPUT_SAMPLE_RATE):
        """
        Initialize audio buffer.

        Args:
            sample_rate: Sample rate of the audio data
        """
        self.sample_rate = sample_rate
        self.buffer = []
        self.total_samples = 0

    def add_chunk(self, audio_chunk: np.ndarray):
        """
        Add an audio chunk to the buffer.

        Args:
            audio_chunk: Numpy array of audio samples
        """
        self.buffer.append(audio_chunk)
        self.total_samples += len(audio_chunk)

    def get_duration(self) -> float:
        """
        Get total duration of buffered audio in seconds.

        Returns:
            Duration in seconds
        """
        return self.total_samples / self.sample_rate

    def get_all_audio(self) -> np.ndarray:
        """
        Get all buffered audio as a single array.

        Returns:
            Concatenated audio array
        """
        if not self.buffer:
            return np.array([], dtype=np.float32)
        return np.concatenate(self.buffer)

    def clear(self):
        """Clear the buffer."""
        self.buffer = []
        self.total_samples = 0

    def is_empty(self) -> bool:
        """Check if buffer is empty."""
        return len(self.buffer) == 0


# Convenience functions for common audio library integrations

def pyaudio_callback_to_base64(in_data: bytes, frame_count: int) -> str:
    """
    Convert PyAudio callback data to base64 for Gemini Live API.

    Args:
        in_data: Audio data from PyAudio callback
        frame_count: Number of frames in the callback

    Returns:
        Base64-encoded audio string

    Example:
        >>> def callback(in_data, frame_count, time_info, status):
        ...     base64_audio = pyaudio_callback_to_base64(in_data, frame_count)
        ...     # Send to Gemini Live API
        ...     return (in_data, pyaudio.paContinue)
    """
    # PyAudio typically provides float32 data
    audio_array = np.frombuffer(in_data, dtype=np.float32)
    return convert_to_gemini_input_format(audio_array, INPUT_SAMPLE_RATE, 'float32')


def sounddevice_to_base64(indata: np.ndarray, frames: int) -> str:
    """
    Convert sounddevice input data to base64 for Gemini Live API.

    Args:
        indata: Audio data from sounddevice callback
        frames: Number of frames

    Returns:
        Base64-encoded audio string

    Example:
        >>> def callback(indata, frames, time, status):
        ...     base64_audio = sounddevice_to_base64(indata, frames)
        ...     # Send to Gemini Live API
    """
    # Sounddevice provides (frames, channels) shape, get first channel
    if len(indata.shape) > 1:
        audio_data = indata[:, 0]
    else:
        audio_data = indata

    return convert_to_gemini_input_format(audio_data, INPUT_SAMPLE_RATE, 'float32')


# MIME type constant for API requests
GEMINI_AUDIO_MIME_TYPE = f"audio/pcm;rate={INPUT_SAMPLE_RATE}"
