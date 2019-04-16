using UnityEngine;
using System;
using System.Threading.Tasks;
using System.Net.Http;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.Text;
using System.Net.Http.Headers;
using System.Reflection;

public class HttpRequest
{
    public async static Task<T> Get<T>(string url)
    {
        var httpClient = new HttpClient();
        var response = await httpClient.GetAsync(String.Format(url));
        response.EnsureSuccessStatusCode();

        string responseContent = await response.Content.ReadAsStringAsync();

        Debug.Log(responseContent);

        T data = JsonConvert.DeserializeObject<T>(responseContent);

        return data;
    }

    public async static Task<string> Post(string url, object values)
    {
        HttpResponseMessage response = await PostInternal(url, values);
        GenerateDebugMessage(url, values);
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

    public async static Task<T> Post<T>(string url, object values)
    {
        HttpResponseMessage response = await PostInternal(url, values);
        GenerateDebugMessage(url, values);
        string responseContent = await response.Content.ReadAsStringAsync();
        T responseObject = JsonConvert.DeserializeObject<T>(responseContent);

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

    public async static Task<HttpResponseMessage> PostInternal(string url, object values)
    {
        var stringContent = new StringContent(JsonConvert.SerializeObject(values), Encoding.UTF8, "application/json");
        stringContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");

        var httpClient = new HttpClient();
        return await httpClient.PostAsync(String.Format(url), stringContent);
    }

    private static void GenerateDebugMessage(string url, object values)
    {
        string valuesText = "";
        foreach (PropertyInfo propertyInfo in values.GetType().GetProperties())
        {
            valuesText += propertyInfo.Name + " = " + propertyInfo.GetValue(values, null) + "; ";
        }

        Debug.Log("Send POST to server. Url: '" + url + "' Body: " + valuesText);
    }
}
