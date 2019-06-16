using DG.Tweening;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class BlinkedSpriteRenderer : MonoBehaviour
{
    public float blinkOpacityUp = 0.2f;
    public float blinkOpacityDown = 0.1f;
    public float blinkSpeed = 1.0f;

    private Sequence sequence;
    private bool IsBlinkOn;
    private Color InitialColor;

    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void BlinkOn()
    {
        var spriteRenderer = this.GetComponent<SpriteRenderer>();

        this.InitialColor = spriteRenderer.color;

        var color1 = spriteRenderer.color;
        color1.a = blinkOpacityUp;

        var color2 = spriteRenderer.color;
        color2.a = blinkOpacityDown;

        spriteRenderer.color = color1;

        this.sequence = DOTween.Sequence();
        this.sequence.Append(spriteRenderer.DOColor(color2, blinkSpeed).SetEase(Ease.Linear));
        this.sequence.Append(spriteRenderer.DOColor(color1, blinkSpeed).SetEase(Ease.Linear));
        this.sequence.OnComplete(() => this.sequence.Restart());

        this.IsBlinkOn = true;
    }

    public void BlinkOff()
    {
        if (!IsBlinkOn)
        {
            return;
        }

        this.IsBlinkOn = false;

        var spriteRenderer = this.GetComponent<SpriteRenderer>();
        this.sequence.OnComplete(null);
        this.sequence.Kill();

        spriteRenderer.color = this.InitialColor;
    }
}
