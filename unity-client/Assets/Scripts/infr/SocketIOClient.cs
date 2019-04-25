using System;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using UnityEngine;
using System.Collections.Generic;
using Newtonsoft.Json;

//[Serializable]
//public class SocketData<Action>
//{
//    public Action[] actions;
//}

//[Serializable]
//public class SocketAction
//{
//    public string type;
//}

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
        //connection.On("event", OnEvent);

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
        Debug.Log("Socket error:" + e.data);
    }

    protected void OnEvent(SocketIO.SocketIOEvent e)
    {
        Debug.Log(e.data);
        //receiverFromServer.ProcessAction(e.data.type, e.data);
    }
}