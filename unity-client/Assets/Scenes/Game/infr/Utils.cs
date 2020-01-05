using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class Utils : MonoBehaviour
{
    public static Utils Instance;

    public void Awake()
    {
        Utils.Instance = this;
    }

    public void SetTimeout(float duration, Action action)
    {
        StartCoroutine(this.Wait(duration, action));
    }

    private IEnumerator Wait(float duration, Action action)
    {
        yield return new WaitForSeconds(duration / 1000);
        action();
    }
}
