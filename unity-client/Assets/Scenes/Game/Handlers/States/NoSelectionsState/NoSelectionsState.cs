using UnibusEvent;

public class NoSelectionsState
{
    private PlayerActionsOnBoardStates states;
    private BoardCreator boardCreator;
    private BoardActivities boardActivities;
    private HandActivities handActivities;

    public NoSelectionsState(PlayerActionsOnBoardStates states, BoardCreator boardCreator)
    {
        this.states = states;
        this.boardCreator = boardCreator;

        this.boardActivities = new BoardActivities(boardCreator)
        {
            OnAllySelected = this.EnableOwnUnitSelectedState
        };

        this.handActivities = new HandActivities(states, boardCreator)
        {
            OnCardSelectedToPlay = this.OnCardSelectedToPlay
        };
    }

    public void Enable()
    {
        this.boardActivities.Enable();
        this.handActivities.Enable();
    }

    private void EnableOwnUnitSelectedState(UnitDisplay unit)
    {
        this.Disable();
        this.states.ownUnitSelectedState.Enable(unit);
    }

    private void OnCardSelectedToPlay(CardDisplay card)
    {
        this.Disable();
        this.states.selectingTileForCardPlayingState.Enable(card);
    }
    
    private void Disable()
    {
        this.boardActivities.Disable();
        this.handActivities.Disable();
    }
}
