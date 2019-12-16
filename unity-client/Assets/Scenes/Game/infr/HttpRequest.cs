using UnityEngine;
using System;
using System.Threading.Tasks;
using System.Net.Http;
using System.Collections.Generic;
using Newtonsoft.Json;
using System.Text;
using System.Net.Http.Headers;
using System.Reflection;
using UnibusEvent;

public class HttpRequest
{
    public static string HTTP_ERROR = "HTTP_ERROR";

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
            Debug.Log("Error: " + responseContent);

            Unibus.Dispatch(HTTP_ERROR, responseContent);
        }

        return responseContent;
    }

    public async static Task<T> Post<T>(string url, object values = null)
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
            Debug.Log("Error: " + responseContent);

            Unibus.Dispatch(HTTP_ERROR, responseContent);
        }

        return responseObject;
    }

    public async static Task<HttpResponseMessage> PostInternal(string url, object values)
    {
        string content = values == null ? "" : JsonConvert.SerializeObject(values);
        var stringContent = new StringContent(content, Encoding.UTF8, "application/json");

        stringContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");

        var httpClient = new HttpClient();
        return await httpClient.PostAsync(String.Format(url), stringContent);
    }

    private static void GenerateDebugMessage(string url, object values)
    {
        string valuesText = "";

        if (values != null)
        {
            foreach (PropertyInfo propertyInfo in values.GetType().GetProperties())
            {
                valuesText += propertyInfo.Name + " = " + propertyInfo.GetValue(values, null) + "; ";
            }
        }

        Debug.Log("Send POST to server. Url: '" + url + "' Body: " + valuesText);
    }
}
