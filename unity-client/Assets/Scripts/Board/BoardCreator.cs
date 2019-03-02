using TMPro;
using UnityEngine;

public class BoardCreator : MonoBehaviour
{
    public int Width;
    public int Height;

    public GameObject TilePrefab;
    public GameObject UnitPrefab;

    private GameObject[,] Tiles;

    private float tileWidth;
    private float tileHeight;

    private Sprite fat;
    private Sprite boar;
    private Sprite goblin;
    private Sprite hero;
    private Sprite reptile;
    private Sprite skeleton;

    public void CreateUnit(CardData cardData)
    {
        Vector2 position = new Vector2(cardData.x, cardData.y);

        GameObject unit = Instantiate<GameObject>(UnitPrefab, this.transform);
        unit.transform.SetParent(this.transform);
        unit.transform.localPosition = PointerToIcometric(position, tileWidth, tileHeight);

        Unit unitComponent = unit.GetComponent<Unit>();

        if (cardData.name == "Герой")
        {
            unitComponent.SetSprite(hero);
        }
        if (cardData.name == "Толстокожая")
        {
            unitComponent.SetSprite(fat);
        }
        if (cardData.name == "Гоблин")
        {
            unitComponent.SetSprite(goblin);
        }
        if (cardData.name == "Кабан")
        {
            unitComponent.SetSprite(boar);
        }
        if (cardData.name == "Ящер")
        {
            unitComponent.SetSprite(reptile);
        }
        if (cardData.name == "Скелет")
        {
            unitComponent.SetSprite(skeleton);
        }
    }

    private void Awake()
    {
        fat = Resources.Load<Sprite>("Sprites/Units/fat");
        boar = Resources.Load<Sprite>("Sprites/Units/boar");
        goblin = Resources.Load<Sprite>("Sprites/Units/goblin");
        hero = Resources.Load<Sprite>("Sprites/Units/hero");
        reptile = Resources.Load<Sprite>("Sprites/Units/reptile");
        skeleton = Resources.Load<Sprite>("Sprites/Units/skeleton");

        CreateTiles();
    }

    private void CreateTiles ()
    {
        Tiles = new GameObject[Width + 1, Height + 1];

        for (int x = 1; x <= Width; x++)
        {
            for (int y = 1; y <= Height; y++)
            {
                GameObject tile = Instantiate<GameObject>(TilePrefab, this.transform);
                tile.transform.SetParent(this.transform);

                RectTransform rt = (RectTransform)tile.transform;
                tileWidth = rt.rect.width;
                tileHeight = rt.rect.height;

                // Show text
                //TextMeshPro text = tile.transform.Find("Text").gameObject.GetComponent<TextMeshPro>();
                //text.SetText(x.ToString() + ";" + y.ToString());

                tile.transform.localPosition = PointerToIcometric(new Vector2(x, y), tileWidth, tileHeight);

                Tiles[x, y] = tile as GameObject;
            }
        }
    }
       
    Vector3 PointerToIcometric(Vector2 vector, float tileWidth, float tileHeight)
    {
        float x = vector.x;
        float y = vector.y;

        return new Vector2(
            (x - y) * (tileWidth / 2),
            (x + y) * (tileHeight / 2)
        );
    }
}
