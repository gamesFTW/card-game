using System;
using UnityEngine;
using System.Collections;
using WebSocketSharp;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Runtime.InteropServices;

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

// Механизм того чтобы все работало в мейн треде хорошо бы вынести в отдельный класс.
public class WebSocketClient : MonoBehaviour
{
    public event Action OnConnected;
    public bool connected = false;

    [DllImport("__Internal")]
    private static extern void WebSocketConnect(string url);

    [DllImport("__Internal")]
    private static extern void WebSocketSend(string message);

    [DllImport("__Internal")]
    private static extern void WebSocketClose();

    private WebSocket ws;
    private string serverUrl = "ws://localhost:3000";
    private ReceiverFromServer receiverFromServer;
    // Нужно для того чтобы все что внутри юнити работало в меин треде
    private static readonly Queue<Action> _executionQueue = new Queue<Action>();
    private bool _isWebGL;

    void Start()
    {
        _isWebGL = Application.platform == RuntimePlatform.WebGLPlayer;

        if (_isWebGL)
        {
            ConnectWebGL();
        }
        else
        {
            ConnectStandalone();
        }
    }

    void ConnectWebGL()
    {
#if UNITY_WEBGL && !UNITY_EDITOR
        WebSocketConnect(serverUrl);
#endif
    }

    void ConnectStandalone()
    {
        ws = new WebSocket(serverUrl);

        ws.OnOpen += (sender, e) => RunOnMainThread(OnWebSocketOpen);
        ws.OnMessage += (sender, e) => RunOnMainThread(() => OnWebSocketMessage(e.Data));
        ws.OnError += (sender, e) => RunOnMainThread(() => OnWebSocketError(e.Message));
        ws.OnClose += (sender, e) => RunOnMainThread(OnWebSocketClose);

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

    // Вызывается из JSLIB или websocket-sharp
    private void OnWebSocketOpen()
    {
        Debug.Log("WebSocket connected");
        OnConnected?.Invoke();
        connected = true;
    }

    private void OnWebSocketMessage(string message)
    {
        try
        {
            Debug.Log("Message received: " + message);

            var serverMessage = message;

            SocketData<SocketAction> socketData = JsonConvert.DeserializeObject<SocketData<SocketAction>>(serverMessage);
            if (socketData.actions.Length == 1)
            {
                var action = socketData.actions[0];
                receiverFromServer.ProcessAction(action.type, serverMessage);
            }
            else
            {
                var actions = new List<string>();
                for (int i = 0; i < socketData.actions.Length; i++)
                {
                    actions.Add(socketData.actions[i].type);
                }

                receiverFromServer.ProcessActions(actions, serverMessage);
            }
        }
        catch (Exception error)
        {
            Debug.Log(error);
            throw;
        }
    }

    private void OnWebSocketError(string error)
    {
        Debug.LogError("WebSocket error: " + error);
    }

    private void OnWebSocketClose()
    {
        Debug.Log("WebSocket closed");
    }

    void OnDestroy()
    {
        if (_isWebGL)
        {
#if UNITY_WEBGL && !UNITY_EDITOR
            WebSocketClose();
#endif
        }
        else
        {
            ws?.Close();
        }
    }

    public void SocketSend(string message)
    {
        if (_isWebGL)
        {
            #if UNITY_WEBGL && !UNITY_EDITOR
            WebSocketSend(message);
            #endif
        }
        else
        {
            ws?.Send(message);
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

    public void RegisterClient(ReceiverFromServer receiverFromServer)
    {
        this.receiverFromServer = receiverFromServer;

        var data = new
        {
            type = "register",
            message = new
            {
                playerId = GameState.mainPlayerId,
                gameId = GameState.gameId
            }
        };

        string json = Newtonsoft.Json.JsonConvert.SerializeObject(data, Formatting.Indented);

        Debug.Log("Socket send: " + json);
        SocketSend(json);
        Debug.Log("Socket registred");
    }
}
