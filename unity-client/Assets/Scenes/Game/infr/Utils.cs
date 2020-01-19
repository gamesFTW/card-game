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

    public void PlayEffect(string path, Transform parent, int duration)
    {
        GameObject prefab = Resources.Load<GameObject>(path);
        GameObject effect = Instantiate<GameObject>(prefab, parent);
        effect.transform.localPosition += new Vector3(0, 0.4f, 0);
        effect.transform.SetParent(parent);

        Utils.Instance.SetTimeout(duration, () =>
            {
                Destroy(effect);
            }
        );
    }

    private IEnumerator Wait(float duration, Action action)
    {
        yield return new WaitForSeconds(duration / 1000);
        action();
    }
}
