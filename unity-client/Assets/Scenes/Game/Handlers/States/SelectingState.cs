using System;
using UnibusEvent;
using UnityEngine;

public abstract class SelectingState
{
    public ActionEmmiter actionEmmiter;
    public Action OnEnabled;

    protected PlayerActionsOnBoardStates states;
    protected BoardCreator boardCreator;

    public SelectingState(PlayerActionsOnBoardStates states, BoardCreator boardCreator)
    {
        this.states = states;
        this.boardCreator = boardCreator;
    }

    protected void Enable()
    {
        this.OnEnabled();
        Unibus.Subscribe<string>(ClickOutOfBoardEmmiter.CLICK_OUT_OF_BOARD, OnClickOutOfBoard);
        Unibus.Subscribe<string>(ClickOutOfBoardEmmiter.RIGHT_CLICK, OnRightClick);
    }

    protected virtual void Disable()
    {
        Unibus.Unsubscribe<string>(ClickOutOfBoardEmmiter.CLICK_OUT_OF_BOARD, OnClickOutOfBoard);
        Unibus.Unsubscribe<string>(ClickOutOfBoardEmmiter.RIGHT_CLICK, OnRightClick);
    }

    protected abstract void EnableNoSelectionsState();

    private void OnClickOutOfBoard(string clickEvent)
    {
        this.EnableNoSelectionsState();
    }

    private void OnRightClick(string clickEvent)
    {
        this.EnableNoSelectionsState();
    }
}
