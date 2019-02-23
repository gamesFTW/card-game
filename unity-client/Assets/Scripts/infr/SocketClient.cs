using System;
using System.Net.Sockets;
using System.Text;
using System.Threading;
using UnityEngine;
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

public class SocketClient : MonoBehaviour
{
    private TcpClient socketConnection;
    private Thread clientReceiveThread;
    private ActionController controller;
    private SocketListener socketListener;

    void Start()
    {
        controller = this.GetComponent<ActionController>();

        ConnectToTcpServer();
    }

    private void ConnectToTcpServer()
    {
        socketListener = new SocketListener();

        new Thread(socketListener.ListenForData).Start();
    }

    void Update()
    {
        if (socketListener.events.Count > 0)
        {
            var serverMessage = socketListener.events[0];
            socketListener.events.RemoveAt(0);

            SocketData<SocketAction> socketData = JsonUtility.FromJson<SocketData<SocketAction>>(serverMessage);

            for (int i = 0; i < socketData.actions.Length; i++)
            {
                var action = socketData.actions[i];
                controller.ProcessAction(action.type, i, serverMessage);
            }
        }
    }

    private void SendMessage()
    {
        if (socketConnection == null)
        {
            return;
        }
        try
        {
            // Get a stream object for writing.             
            NetworkStream stream = socketConnection.GetStream();
            if (stream.CanWrite)
            {
                string clientMessage =  "Hello";
                // Convert string message to byte array.                 
                byte[] clientMessageAsByteArray = Encoding.ASCII.GetBytes(clientMessage);
                // Write byte array to socketConnection stream.                 
                stream.Write(clientMessageAsByteArray, 0, clientMessageAsByteArray.Length);
                Debug.Log("Client sent his message - should be received by server");
            }
        }
        catch (SocketException socketException)
        {
            Debug.Log("Socket exception: " + socketException);
        }
    }
}

public class SocketListener
{
    public List<string> events = new List<string>();
    public TcpClient socketConnection;

    public void ListenForData()
    {
        try
        {
            socketConnection = new TcpClient("localhost", 3002);
            Byte[] bytes = new Byte[1024];
            while (true)
            {
                using (NetworkStream stream = socketConnection.GetStream())
                {
                    int length;
                    while ((length = stream.Read(bytes, 0, bytes.Length)) != 0)
                    {
                        this.GetActionsFromBytes(bytes, length);
                    }
                }
            }
        }
        catch (SocketException socketException)
        {
            Debug.Log("Socket exception: " + socketException);
        }
    }

    private void GetActionsFromBytes(Byte[] bytes, int length)
    {
        var incommingData = new byte[length];
        Array.Copy(bytes, 0, incommingData, 0, length);
        string serverMessage = Encoding.ASCII.GetString(incommingData);

        events.Add(serverMessage);
    }
}