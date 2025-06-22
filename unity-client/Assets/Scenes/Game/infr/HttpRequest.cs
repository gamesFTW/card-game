using UnityEngine;
using System;
using UnityEngine.Networking;
using Cysharp.Threading.Tasks;
using Newtonsoft.Json;
using UnibusEvent;

public class HttpRequest
{
    public static string HTTP_ERROR = "HTTP_ERROR";

    public static async UniTask<T> Get<T>(string url)
    {
        using var request = UnityWebRequest.Get(url);
        await request.SendWebRequest();
        if (request.result != UnityWebRequest.Result.Success)
        {
            throw new Exception($"HTTP Error {request.responseCode}: {request.error}");
        }

        try
        {
            return JsonConvert.DeserializeObject<T>(request.downloadHandler.text);
        }
        catch (Exception ex)
        {
            throw new Exception($"JSON Parse Error: {ex.Message}");
        }
    }

    public static async UniTask<T> Post<T>(string url, object data = null)
    {
        var json = await PostRaw(url, data);
        try
        {
            return JsonConvert.DeserializeObject<T>(json);
        }
        catch (Exception ex)
        {
            throw new Exception($"JSON Parse Error: {ex.Message}");
        }
    }

    public static async UniTask<string> Post(string url, object data = null)
    {
        return await PostRaw(url, data);
    }

    private static async UniTask<string> PostRaw(string url, object data = null)
    {
        string json = data != null ? JsonConvert.SerializeObject(data) : "{}";
        byte[] payload = System.Text.Encoding.UTF8.GetBytes(json);

        using var request = new UnityWebRequest(url, "POST");
        request.uploadHandler = new UploadHandlerRaw(payload);
        request.downloadHandler = new DownloadHandlerBuffer();
        request.SetRequestHeader("Content-Type", "application/json");
        try
        {
            await request.SendWebRequest();
        }
        catch
        {
            Unibus.Dispatch(HTTP_ERROR, request.downloadHandler.text);
            throw new Exception($"HTTP Error {request.responseCode}: {request.error}");
        }

        return request.downloadHandler.text;
    }
}
