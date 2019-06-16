using UnityEngine;
using System.Collections;
using DG.Tweening;

public class UnitDisplay : MonoBehaviour
{
    public Sprite sprite;
    public CardDisplay CardDisplay;

    private Tween shakeTween;

    public CardData CardData
    {
        get { return cardData; }
        set {
            cardData = value;
            StartCoroutine(LoadSprite());
        }
    }

    private CardData cardData;

    private GameObject blueGlow;
    private GameObject redGlow;

    // Start is called before the first frame update
    void Start()
    {
        this.blueGlow = this.transform.Find("BlueGlow").gameObject;
        this.redGlow = this.transform.Find("RedGlow").gameObject;

        this.EnableTeamColor();
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void EnableTeamColor()
    {
        if (this.cardData.ownerId == GameState.mainPlayerId)
        {
            blueGlow.SetActive(true);
        }
        else
        {
            redGlow.SetActive(true);
        }
    }

    public void DisableTeamColor()
    {
        blueGlow.SetActive(false);
        redGlow.SetActive(false);
    }

    public void TeamColorBlinkOn()
    {
        var spriteRenderer = this.redGlow.GetComponent<BlinkedSpriteRenderer>();
        spriteRenderer.BlinkOn();
    }

    public void TeamColorBlinkOff()
    {
        var spriteRenderer = this.redGlow.GetComponent<BlinkedSpriteRenderer>();
        spriteRenderer.BlinkOff();
    }

    public void Shake()
    {
        bool isNeedShake = true;

        if (this.shakeTween != null && this.shakeTween.IsPlaying())
        {
            isNeedShake = false;
        }

        if (isNeedShake)
        {
            shakeTween = this.transform.DOShakePosition(0.5f, new Vector3(0.2f, 0, 0), 10, 90);
        }
    }

    private IEnumerator LoadSprite()
    {
        WWW www = new WWW(Config.LOBBY_SERVER_URL + CardData.image);
        yield return www;

        Sprite sprite = Sprite.Create(www.texture, new Rect(0, 0, www.texture.width, www.texture.height), new Vector2(0.5F, 0.5F));

        SpriteRenderer spriteRenderer = GetComponent<SpriteRenderer>();
        spriteRenderer.sprite = sprite;
    }
}
