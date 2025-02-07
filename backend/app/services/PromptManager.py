from langchain_core.prompts import ChatPromptTemplate

class PromptManager():
  def __init__(
      self,
      input_prompt: list = [],
      append_history: bool = True,
      append_human_input: bool = True,
      ):
    self.input_prompt = input_prompt

    """
      Args:
        input_prompt:
          Array of JSON objects containing the prompt.
        append_human_input:
          Whether to append human input at the end of prompt.
          Defaults to True.
        append_history:
          Whether to append the history of conversation before human input.
          Defaults to True.
    """

    self.prompt_array = []
    for json in input_prompt:
      if "system" in json:
        # print(json["system"])
        self.prompt_array.append(("system", json["system"]))
      elif "human" in json:
        self.prompt_array.append(("human", json["human"]))
      elif "ai" in json:
        self.prompt_array.append(("ai", json["ai"]))
      elif "assistant" in json:
        self.prompt_array.append(("assistant", json["assistant"]))
      elif "placeholder" in json:
        self.prompt_array.append(("placeholder", json["placeholder"]))
      else:
        raise Exception("Unexpected message type: systsem. Use one of 'human', 'user', 'ai', 'assistant', 'placeholder' or 'system'.")

    if append_history:
      self.prompt_array.append(("placeholder", "{history}"))
      
    if append_human_input:
      self.prompt_array.append(("human", "{message}"))

  def get(self):
    return ChatPromptTemplate.from_messages(self.prompt_array)
