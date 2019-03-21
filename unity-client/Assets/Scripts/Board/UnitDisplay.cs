using UnityEngine;
using UnityEditor.Presets;

public class UnitDisplay : MonoBehaviour
{
    public Sprite sprite;
    public CardDisplay CardDisplay;

    public CardData CardData
    {
        get { return cardData; }
        set {
            cardData = value;
            SetSprite();
        }
    }

    private CardData cardData;

    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        
    }

    public void SetSprite()
    {
        Sprite sprite = FindSprite();
        SpriteRenderer spriteRenderer = GetComponent<SpriteRenderer>();
        spriteRenderer.sprite = sprite;
    }

    private Sprite FindSprite()
    {
        if (cardData.name == "Герой")
        {
            return BoardCreator.hero;
        }
        if (cardData.name == "Толстокожая")
        {
            return BoardCreator.fat;
        }
        if (cardData.name == "Гоблин")
        {
            return BoardCreator.goblin;
        }
        if (cardData.name == "Кабан")
        {
            return BoardCreator.boar;
        }
        if (cardData.name == "Ящер")
        {
            return BoardCreator.reptile;
        }
        if (cardData.name == "Скелет")
        {
            return BoardCreator.skeleton;
        }

        return null;
    }
}
