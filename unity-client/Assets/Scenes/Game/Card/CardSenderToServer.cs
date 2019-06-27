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
    public bool isRangeAttack;
    public AbilitiesParams abilitiesParams;
}

public class AbilitiesParams
{
    public Point pushAt;
    public string ricochetTargetCardId;
}

public class CardSenderToServer : MonoBehaviour
{
    void Start()
    {
        Unibus.Subscribe<CardDisplay>(CardDisplay.CARD_PLAY_AS_MANA, OnCardPlayAsMana);
        Unibus.Subscribe<PlayCardAction> (SelectingTileForCardPlayingState.CARD_PLAY, OnCardPlay);
        Unibus.Subscribe<MoveCardAction> (PlayerActivities.CARD_MOVE, OnCardMove);
        Unibus.Subscribe<AttackCardAction> (PlayerActivities.CARD_ATTACK, OnCardAttack);
    }

    void Update() 
    {

    }

    async void OnCardPlayAsMana(CardDisplay card)
    {
        await ServerApi.PlayCardAsMana(card.cardData.id);
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
