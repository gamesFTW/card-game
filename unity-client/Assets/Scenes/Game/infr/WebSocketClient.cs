using System;
using UnityEngine;
using System.Collections;
using WebSocketSharp;
using Newtonsoft.Json;
using System.Collections.Generic;

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

public class WebSocketClient : MonoBehaviour
{
    private WebSocket ws;
    private string serverUrl = "ws://localhost:3000";
    private ReceiverFromServer receiverFromServer;
    // Нужно для того чтобы все что внутри юнити работало в меин треде
    private static readonly Queue<Action> _executionQueue = new Queue<Action>();

    public void RegisterClient()
    {
        receiverFromServer = this.GetComponent<ReceiverFromServer>();

        if (!receiverFromServer)
        {
            throw new Exception("There is no ReciverFromServer on the same component");
        }

        Register();
    }

    void Register()
    {
        var data = new {
            type = "register",
            message = new {
                playerId = GameState.mainPlayerId,
                gameId = GameState.gameId
            }
        };

        string json = Newtonsoft.Json.JsonConvert.SerializeObject(data, Formatting.Indented);

        Debug.Log("Socket send: " + json);
        ws.Send(json);
        Debug.Log("Socket registred");
    }

    void Start()
    {
        ws = new WebSocket(serverUrl);
        
        ws.OnOpen += (sender, e) => {
            Debug.Log("WebSocket connected");
        };
        
        ws.OnMessage += (sender, e) => {
            try
            {
                // Нужно для того чтобы все что внутри юнити работало в меин треде
                RunOnMainThread(() =>
                {
                    Debug.Log("Message received: " + e.Data);

                    var serverMessage = e.Data;

                    SocketData<SocketAction> socketData = JsonConvert.DeserializeObject<SocketData<SocketAction>>(serverMessage);
                    if (socketData.actions.Length == 1)
                    {
                        var action = socketData.actions[0];
                        receiverFromServer.ProcessAction(action.type, serverMessage);
                    } else
                    {
                        var actions = new List<string>();
                        for (int i = 0; i < socketData.actions.Length; i++)
                        {
                            actions.Add(socketData.actions[i].type);
                        }

                        receiverFromServer.ProcessActions(actions, serverMessage);
                    }
                    
                });
            }
            catch (Exception error)
            {
                Debug.Log(error);
                throw;
            }
        };
        
        ws.OnError += (sender, e) => {
            Debug.LogError("WebSocket error: " + e.Message);
        };
        
        ws.OnClose += (sender, e) => {
            Debug.Log("WebSocket closed: " + e.Reason);
        };
        
        ws.Connect();
    }

    public void Update()
    {
        // Нужно для того чтобы все что внутри юнити работало в меин треде
        lock (_executionQueue)
        {
            while (_executionQueue.Count > 0)
            {
                _executionQueue.Dequeue().Invoke();
            }
        }
    }

    void OnDestroy()
    {
        if (ws != null && ws.IsAlive)
        {
            ws.Close();
        }
    }

    // Нужно для того чтобы все что внутри юнити работало в меин треде
    public void RunOnMainThread(Action action)
    {
        lock (_executionQueue)
        {
            _executionQueue.Enqueue(action);
        }
    }
}
