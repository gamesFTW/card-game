using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class AreaDisplay : MonoBehaviour
{
    public Sprite sprite;

    public AreaData areaData;

    // Start is called before the first frame update
    void Start()
    {
    }

    // Update is called once per frame
    void Update()
    {

    }

    public void Init()
    {
        Sprite sprite = null;

        if (areaData.type == "lake") {
            sprite = Resources.Load<Sprite>("Sprites/Areas/lake-micro");
        }
        if (areaData.type == "mountain") {
            sprite = Resources.Load<Sprite>("Sprites/Areas/hollow-micro");
        }
        if (areaData.type == "windWall") {
            sprite = Resources.Load<Sprite>("Sprites/Areas/windwall-micro");
        }

        SpriteRenderer spriteRenderer = GetComponent<SpriteRenderer>();
        spriteRenderer.sprite = sprite;
    }
}
