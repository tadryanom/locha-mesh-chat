import { ActionTypes } from "../constants";
import { generateName } from "../../utils/utils";
import {
  setMessage,
  addTemporalInfo,
  verifyContact,
  getTemporalContact,
  deleteChatss,
  cleanChat
} from "../../database/realmDatabase";
import { notification } from "../../utils/utils";
import { sendSocket } from "../../utils/socket";
import { sha256 } from "js-sha256";

/**
 * @function
 * @description send the messages to the socket and save them in the database
 * @param {object} data Information about the chat
 * @param {string} data.toUID address where the message will be sent
 * @param {string} data.fromUID uid who is sending the message
 * @param {object} data.msg  message content
 * @param {number} timestamp sent date
 * @param  {string} type type message
 * @returns {object}
 */

export const initialChat = data => dispatch => {
  let uidChat = data.toUID ? data.toUID : "broadcast";
  setMessage(uidChat, { ...data }).then(() => {
    sendSocket.send(JSON.stringify(data));
    dispatch({
      type: ActionTypes.NEW_MESSAGE,
      payload: {
        name: undefined,
        ...data,
        msg: data.msg.text,
        id: data.msgID
      }
    });
  });
};

/**
 * @function
 * @description function to save random name or contact name (if it exists) to be shown on public channels
 * @param {object} parse Information about the message
 * @param {string} parse.toUID address where the message will be sent
 * @param {string} parse.fromUID uid who is sending the message
 * @param {object} parse.msg  message content
 * @param {number} parse.timestamp sent date
 * @param  {string}parse.type type message
 * @param {string} id id user
 * @returns {object}
 */

export const broadcastRandomData = async (parse, id) =>
  new Promise(resolve => {
    const store = require("../../store");
    const userData = id ? id : store.default.getState().config.uid;
    if (sha256(userData) !== parse.fromUID) {
      verifyContact(parse.fromUID).then(res => {
        if (res) {
          resolve(res);
        } else {
          getTemporalContact(parse.fromUID).then(temporal => {
            if (temporal) {
              resolve(temporal);
            } else {
              const randomName = generateName();
              const obj = {
                hashUID: parse.fromUID,
                name: randomName,
                timestamp: parse.timestamp
              };
              addTemporalInfo(obj).then(data => {
                resolve(data);
              });
            }
          });
        }
      });
    } else {
      resolve({ name: undefined });
    }
  });

/**
 * @function
 * @description This function is executed every time a new message arrives from the socket and saves it in the database.
 * @param {object} data Information about the message
 * @param {string} data.toUID address where the message will be sent
 * @param {string} data.fromUID uid who is sending the message
 * @param {object} data.msg  message content
 * @param {number} data.timestamp sent date
 * @param  {string} data.type type message
 * @returns {object}
 */

export const getChat = data => async dispatch => {
  const parse = JSON.parse(data);
  let infoMensagge = undefined;
  if (!parse.toUID) {
    infoMensagge = await broadcastRandomData(parse);
  }

  let uidChat = parse.toUID ? parse.fromUID : "broadcast";

  let name = infoMensagge ? infoMensagge.name : undefined;
  setMessage(uidChat, { ...parse, name: name }).then(() => {
    dispatch({
      type: ActionTypes.NEW_MESSAGE,
      payload: {
        name: name,
        ...parse,
        msg: parse.msg.text,
        id: parse.msgID
      }
    });
  });
};

/**
 * @function
 * @description This function is executed every time a new message arrives from the socket and saves it in the database.
 * @param {object} data Information about the message
 * @param {string} data.toUID address where the message will be sent
 * @param {string} data.fromUID uid who is sending the message
 * @param {object} data.msg  message content
 * @param {number} data.timestamp sent date
 * @param  {string} data.type type message
 * @returns {object}
 */

export const selectedChat = obj => dispatch => {
  notification.cancelAll();
  dispatch({
    type: ActionTypes.SELECTED_CHAT,
    payload: obj
  });
};

/**
 * @function
 * @description reload the state of the public chats once the messages are deleted
 * @param {object} data Information about the chat
 * @returns {object}
 */

export const realoadBroadcastChat = data => {
  return {
    type: ActionTypes.RELOAD_BROADCAST_CHAT,
    payload: data
  };
};

/**
 * @function
 * @description delete messages from a specific chat
 * @param {obj} obj
 * @param {callback} callback
 */

export const deleteChat = (obj, callback) => dispatch => {
  deleteChatss(obj).then(() => {
    dispatch({
      type: ActionTypes.DELETE_MESSAGE,
      payload: obj
    });
    callback();
  });
};

/**
 * @function
 * @description delete all messages from a specific chat
 * @param {string} id
 */

export const cleanAllChat = id => dispatch => {
  cleanChat(id).then(() => {
    dispatch({
      type: ActionTypes.DELETE_ALL_MESSAGE,
      payload: id
    });
  });
};
