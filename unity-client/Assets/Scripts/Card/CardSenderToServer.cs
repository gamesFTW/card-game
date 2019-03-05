using UnityEngine;
using UnibusEvent;

public class PlayCardAction
{
    public string cardId;
    public string x;
    public string y;
}

public class MoveCardAction
{
    public string cardId;
    public string x;
    public string y;
}

public class AttackCardAction
{
    public string attackerCardId;
    public string attackedCardId;
}

public class CardSenderToServer : MonoBehaviour
{
    void Start()
    {
        Unibus.Subscribe<string>(CardDisplay.CARD_PLAY_AS_MANA, OnCardPlayAsMana);
        Unibus.Subscribe<PlayCardAction> (PlayCardHandler.CARD_PLAY, OnCardPlay);
        Unibus.Subscribe<MoveCardAction> (MoveCardHandler.CARD_MOVE, OnCardMove);
        Unibus.Subscribe<AttackCardAction> (MoveCardHandler.CARD_ATTACK, OnCardAttack);
    }

    void Update() 
    {

    }

    async void OnCardPlayAsMana(string id)
    {
        await ServerApi.PlayCardAsMana(id);
    }

    async void OnCardPlay(PlayCardAction action)
    {
        await ServerApi.PlayCard(action);
    }

    async void OnCardMove(MoveCardAction action)
    {
        await ServerApi.MoveCard(action);
    }

    async void OnCardAttack(AttackCardAction action)
    {
        await ServerApi.AttackCard(action);
    }
}
