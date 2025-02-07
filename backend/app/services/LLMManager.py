import os
from langchain_community.chat_models import ChatDeepInfra

class LLMManager():
  def __init__(
      self,
      # provider: str,
      model: str,
      max_tokens: int = 0,
      temperature: float = 0.7,
      top_p: float = 1,
      n: int = 1,
      stop: [] = None,
      presence_penalty: float = 0.0,
      frequency_penalty: float = 0.0,
      logit_bias: {} = None,
      logprobs: bool = False,
      parse_output: bool = True,
      stream_usage: bool = True,
      ):

    # self.provider = provider
    self.model = model
    self.max_tokens = max_tokens
    self.temperature = temperature
    self.top_p = top_p
    self.n = n
    self.stop = stop
    self.presence_penalty = presence_penalty
    self.frequency_penalty = frequency_penalty
    self.logit_bias = logit_bias
    self.logprobs = logprobs
    self.parse_output = parse_output
    self.stream_usage = stream_usage

  def get_chatdeepinfra(self):
    return ChatDeepInfra(
        model_name=self.model,
        deepinfra_api_token=os.getenv("DEEPINFRA_API_TOKEN"),
        max_tokens=self.max_tokens,
        temperature=self.temperature,
        top_p=self.top_p,
        n=self.n,
        # stop=self.stop,
        # presence_penalty=self.presence_penalty,
        # frequency_penalty=self.frequency_penalty,
        # logit_bias=self.logit_bias,
        # logprobs=self.logprobs,
        # stream_usage=self.stream_usage,
        streaming=True
      )

  def get(self):
    if self.model == "meta-llama/Llama-3.3-70B-Instruct":
        return self.get_chatdeepinfra()
    elif self.model == "meta-llama/Llama-3.2-90B-Vision-Instruct":
        return self.get_chatdeepinfra()
    elif self.model == "meta-llama/Meta-Llama-3.1-405B-Instruct":
        return self.get_chatdeepinfra()
    else:
      raise Exception("Model not supported")


