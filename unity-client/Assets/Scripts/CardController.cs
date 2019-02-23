using UnityEngine;
using System.Collections;
using UnibusEvent;

public class CardController : MonoBehaviour
{
    // Use this for initialization
    void Start()
    {
        Unibus.Subscribe<string>(CardDisplay.CARD_PLAY_AS_MANA, OnCardPlayAsMana);
    }

    // Update is called once per frame
    void Update()
    {

    }

    async void OnCardPlayAsMana(string id)
    {
        await ServerApi.PlayCardAsMana(id);
    }
}
