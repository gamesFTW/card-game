using System;
using UnityEngine;
using System.Collections.Generic;
using Newtonsoft.Json;

[Serializable]
public class SocketData<Action>
{
    public Action[] actions;
}

[Serializable]
public class SocketAction
{
    public string type;
}


public class SocketIOClient : MonoBehaviour
{
    private ReceiverFromServer receiverFromServer;
    private SocketIOConnection connection;


    public void StartExchange()
    {
        receiverFromServer = this.GetComponent<ReceiverFromServer>();
        connection = this.GetComponent<SocketIOConnection>();

        if (! receiverFromServer)
        {
            throw new Exception("There is no ReciverFromServer on the same component");
        }

        if (!connection)
        {
            throw new Exception("There is no SocketIOConnection on the same component");
        }

        Debug.Log("Found socketIOConnection component url:" + connection.Url);

        SubscribeOnSocketIOEvents();

        if (connection.IsConnected)
        {
            Register();
        }
    }

    protected void SubscribeOnSocketIOEvents ()
    {
        connection.On("open", OnConnection);
        connection.On("close", OnDisconect);
        connection.On("error", OnError);
        connection.On("event", OnEvent);

    }


    private void SendMessage()
    {
        throw new Exception("not implemented");
       
    }

    protected void Register()
    {
        Dictionary<string, string> data = new Dictionary<string, string>();
        data["playerId"] = GameState.mainPlayerId;
        data["gameId"] = GameState.gameId;
        connection.Emit("register", new JSONObject(data));
        Debug.Log("Socket registred");
    }

    protected void OnConnection(SocketIO.SocketIOEvent e)
    {
        Register();
    }

    protected void OnDisconect(SocketIO.SocketIOEvent e)
    {
        Debug.Log("Socket io disconnected");
    }

    protected void OnError(SocketIO.SocketIOEvent e)
    {
        Debug.Log(e);
        Debug.Log("Socket error:" + e.data);
    }

    protected void OnEvent(SocketIO.SocketIOEvent e)
    {
        //Debug.Log("Event");
        Debug.Log(e);
        //Debug.Log(e.data["clientEvents"].ToString());
        var serverMessage = e.data.ToString();

        SocketData<SocketAction> socketData = JsonConvert.DeserializeObject<SocketData<SocketAction>>(serverMessage);

        for (int i = 0; i < socketData.actions.Length; i++)
        {
            Debug.Log(socketData.actions);
            var action = socketData.actions[i];
            receiverFromServer.ProcessAction(action.type, i, serverMessage);
        }

        //(e.data as JObject).ToObject<StatusPong>();
        //receiverFromServer.ProcessAction(e.data["clientEvents"].ToString());
    }
}