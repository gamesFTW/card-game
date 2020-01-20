using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using DG.Tweening;

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

    public void PlayEffect(string prefabPath, Transform parent, int duration)
    {
        GameObject prefab = Resources.Load<GameObject>(prefabPath);
        GameObject effect = Instantiate<GameObject>(prefab, parent);
        effect.transform.localPosition += new Vector3(0, 0.4f, 0);
        effect.transform.SetParent(parent);

        Utils.Instance.SetTimeout(duration, () =>
            {
                Destroy(effect);
            }
        );
    }

    public void LaunchMissile(string prefabPath, Transform parent, Transform from, Transform to, int duration, Action callback)
    {
        GameObject prefab = Resources.Load<GameObject>(prefabPath);
        GameObject effect = Instantiate<GameObject>(prefab, parent);
        var offset = new Vector3(0, 0.4f, 0);
        effect.transform.position = from.position + offset;
        effect.transform.SetParent(parent);
        effect.transform.DOMove(to.position + offset, (float)duration / 1000f);

        Utils.Instance.SetTimeout(duration, () =>
            {
                Destroy(effect);
                callback();
            }
        );
    }

    private IEnumerator Wait(float duration, Action action)
    {
        yield return new WaitForSeconds(duration / 1000);
        action();
    }
}
