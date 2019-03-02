using UnityEngine;
using UnibusEvent;
using System.Collections.Generic;

public class CardSenderToServer : MonoBehaviour
{
    void Start()
    {
        Unibus.Subscribe<string>(CardDisplay.CARD_PLAY_AS_MANA, OnCardPlayAsMana);
        Unibus.Subscribe<Dictionary<string, string>> (PlayCardHandler.CARD_PLAY, OnCardPlay);
    }

    void Update()
    {

    }

    async void OnCardPlayAsMana(string id)
    {
        await ServerApi.PlayCardAsMana(id);
    }

    async void OnCardPlay(Dictionary<string, string> data)
    {
        await ServerApi.PlayCard(data);
    }
}
