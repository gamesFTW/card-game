using System.Collections.Generic;
using UnityEngine;
using DG.Tweening;

public class CardsContainer : MonoBehaviour
{
    private List<CardDisplay> cards = new List<CardDisplay>();

    void Update()
    {
        foreach (CardDisplay cardDisplay in this.cards)
        {
            if (cardDisplay.Placeholder.hasChanged)
            {
                var placeholder = cardDisplay.Placeholder;

                var position = new Vector3(placeholder.position.x, placeholder.position.y, cardDisplay.transform.position.z);
                var scale = placeholder.parent.localScale;

                if (cardDisplay.isMovedAtInitialPosition)
                {
                    cardDisplay.Move(position, scale);
                } else
                {
                    cardDisplay.transform.SetParent(this.transform, false);
                    cardDisplay.MoveAtInitialPosition(position, scale);
                }

                placeholder.hasChanged = false;
            }
        }
    }

    public void AddCard (CardDisplay cardDisplay)
    {
        cards.Add(cardDisplay);
    }
}
