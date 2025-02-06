from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain_core.output_parsers import StrOutputParser
from app.services.chat_message_histories import MongoDBChatMessageHistory

class MongoDBChainOrchestrator():
  def __init__(
      self,
      runnables: [],
      connection_string: str,
      database_name: str,
      collection_id: str,
      parse_output: bool = True,
      history_size: int = 0
      ):

    self.parse_output = parse_output
    self.connection_string = connection_string
    self.database_name = database_name
    self.collection_id = collection_id
    self.history_size = history_size
    
    """
      Dependancies:
        * langchain
        * langchain_core
        * langchain_mongodb
        Bash
          $ pip install langchain langchain-mongodb langchain_core

      Args:
        runnables:
          Runnables array to add to the chain.
        parse_output:
          Whether to parse the output of the chain.
          Defaults to True.
        connection_string:
          Connection string to the MongoDB database.
        database_name:
          Name of the database to use.
        collection_id:
          Name of the collection to use.
    """

    self.chain = runnables[0]
    for i in range(1, len(runnables)):
      try:
        self.chain = self.chain | runnables[i]
      except Exception as e:
        print("Error : ", e)

    if parse_output:
      self.chain = self.chain | StrOutputParser()

  def __chat_message_history__(self, session_id):
    return MongoDBChatMessageHistory(
      connection_string=self.connection_string,
      session_id=session_id,
      database_name=self.database_name,
      collection_id=self.collection_id,
      history_size=self.history_size,
  )

  def __chain_with_history__(self):
    return RunnableWithMessageHistory(
      self.chain,
      lambda session_id:self.__chat_message_history__(session_id),
      input_messages_key="message",
      history_messages_key="history",)

  def ainvoke(self,
             session_id: str,
             context_json: {}):
    config = {"configurable": {"session_id": session_id}}
    try:
      return self.__chain_with_history__().ainvoke(context_json, config=config)
    except Exception as e:
      print("Error : ", e)

  # !WARNING!: Error handling is not working. For eg. in case of MongoDB bad authentication
  def astream(self,
             session_id: str,
             context_json: {}):
    config = {"configurable": {"session_id": session_id}}
    try:
      return self.__chain_with_history__().astream(context_json, config=config)
    except Exception as e:
      print("Error : ", e)

  # !WARNING!: Error handling not checked
  def abatch(self,
             session_id: str,
             context_json: {}):
    config = {"configurable": {"session_id": session_id}}
    try:
      return self.__chain_with_history__().abatch(context_json, config=config)
    except Exception as e:
      print("Error : ", e)

