using UnityEngine;

public class StackDisplay : MonoBehaviour
{
    public bool IsFaceUp;

    virtual public void AddCard(CardDisplay cardDisplay)
    {
        if (cardDisplay.Placeholder == null)
        {
            GameObject cardPlaceholderPrefab = Resources.Load<GameObject>("CardPlaceholder");
            GameObject newCardPlaceholder = (GameObject)Instantiate(cardPlaceholderPrefab, this.transform);
            cardDisplay.Placeholder = newCardPlaceholder.transform;
        }

        cardDisplay.Placeholder.SetParent(this.transform, false);
    }
}
