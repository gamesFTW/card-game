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

        if (this.areaData.type == "lake") {
            sprite = Resources.Load<Sprite>("Down" + this.areaData.subtype);
        }
        if (this.areaData.type == "mountain") {
            sprite = Resources.Load<Sprite>("Stone" + this.areaData.subtype);
        }
        if (this.areaData.type == "windWall")
        {
            sprite = Resources.Load<Sprite>("Bushes" + this.areaData.subtype + "-back");

            var spriteFront = Resources.Load<Sprite>("Bushes" + this.areaData.subtype + "-front");
            this.transform.Find("Front").GetComponent<SpriteRenderer>().sprite = spriteFront;
        }

        SpriteRenderer spriteRenderer = GetComponent<SpriteRenderer>();
        spriteRenderer.sprite = sprite;
    }
}
