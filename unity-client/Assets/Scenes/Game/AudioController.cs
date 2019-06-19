using System.Collections;
using UnibusEvent;
using UnityEngine;

public class AudioController : MonoBehaviour
{
    public static readonly string CARD_ATTACKED = "AudioController:CARD_ATTACKED";
    public static readonly string CARD_PLAYED = "AudioController:CARD_PLAYED";
    public static readonly string CARD_DIED = "AudioController:CARD_DIED";
    public static readonly string CARD_MOVED = "AudioController:CARD_MOVED";
    public static readonly string CARD_SELECTED = "AudioController:CARD_SELECTED";

    private AudioSource AudioSource;

    // Start is called before the first frame update
    void Start()
    {
        Unibus.Subscribe<CardDisplay>(AudioController.CARD_ATTACKED, OnCardAttacked);
        Unibus.Subscribe<CardDisplay>(AudioController.CARD_PLAYED, OnCardPlayed);
        Unibus.Subscribe<CardDisplay>(AudioController.CARD_DIED, OnCardDied);
        Unibus.Subscribe<CardDisplay>(AudioController.CARD_MOVED, OnCardMoved);
        Unibus.Subscribe<CardDisplay>(AudioController.CARD_SELECTED, OnCardSelected);

        this.AudioSource = this.GetComponent<AudioSource>();
    }

    // Update is called once per frame
    void Update()
    {

    }

    private void OnCardAttacked(CardDisplay attackerCard)
    {
        this.Play(attackerCard, "attack");
    }

    private void OnCardPlayed(CardDisplay attackerCard)
    {
        this.Play(attackerCard, "play");
    }

    private void OnCardDied(CardDisplay attackerCard)
    {
        this.Play(attackerCard, "die");
    }

    private void OnCardMoved(CardDisplay attackerCard)
    {
        this.Play(attackerCard, "move");
    }

    private void OnCardSelected(CardDisplay attackerCard)
    {
        this.Play(attackerCard, "select");
    }

    private void Play(CardDisplay card, string soundName)
    {
        if (card.sounds.ContainsKey(soundName))
        {
            this.AudioSource.clip = card.sounds[soundName];
            this.AudioSource.Play();
        }
    }
}
