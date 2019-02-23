using UnityEngine;
using System;
using System.Threading.Tasks;
using System.Net.Http;
using System.Collections.Generic;

public class HttpRequest
{
    public async static Task<string> Post(string url, Dictionary<string, string> values)
    {
        HttpResponseMessage response = await PostInternal(url, values);
        string responseContent = await response.Content.ReadAsStringAsync();

        try
        {
            response.EnsureSuccessStatusCode();
        }
        catch (HttpRequestException e)
        {
            Debug.Log(e);
        }

        return responseContent;
    }

    public async static Task<T> Post<T>(string url, Dictionary<string, string> values)
    {
        HttpResponseMessage response = await PostInternal(url, values);
        string responseContent = await response.Content.ReadAsStringAsync();
        T responseObject = JsonUtility.FromJson<T>(responseContent);

        try
        {
            response.EnsureSuccessStatusCode();
        }
        catch (HttpRequestException e)
        {
            Debug.Log(e);
        }

        return responseObject;
    }

    public async static Task<HttpResponseMessage> PostInternal(string url, Dictionary<string, string> values)
    {
        var httpClient = new HttpClient();
        var content = new FormUrlEncodedContent(values);
        return await httpClient.PostAsync(String.Format(ServerApi.serverURL + url), content);
    }
}
