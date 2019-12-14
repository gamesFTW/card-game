using UnityEngine;

public class CursorController : MonoBehaviour
{
    public static void SetDefault()
    {
        Texture2D cursorTexture = (Texture2D)Resources.Load("Cursor_Basic2");
        Cursor.SetCursor(cursorTexture, new Vector2(19, 4), CursorMode.Auto);
    }

    public static void SetPointer()
    {
        Texture2D cursorTexture = (Texture2D)Resources.Load("Cursor_Hand");
        Cursor.SetCursor(cursorTexture, new Vector2(21, 3), CursorMode.Auto);
    }

    public static void SetPointerForbidden()
    {
        Texture2D cursorTexture = (Texture2D)Resources.Load("Cursor_Hand_Forbidden");
        Cursor.SetCursor(cursorTexture, new Vector2(21, 3), CursorMode.Auto);
    }

    public static void SetAttack()
    {
        Texture2D cursorTexture = (Texture2D)Resources.Load("Cursor_Attack");
        Cursor.SetCursor(cursorTexture, new Vector2(19, 6), CursorMode.Auto);
    }

    public static void SetAttackForbidden()
    {
        Texture2D cursorTexture = (Texture2D)Resources.Load("Cursor_Attack_Forbidden");
        Cursor.SetCursor(cursorTexture, new Vector2(19, 6), CursorMode.Auto);
    }

    public static void SetRangeAttack()
    {
        Texture2D cursorTexture = (Texture2D)Resources.Load("Cursor_shoot");
        Cursor.SetCursor(cursorTexture, new Vector2(5, 7), CursorMode.Auto);
    }

    public static void SetRangeAttackForbidden()
    {
        Texture2D cursorTexture = (Texture2D)Resources.Load("Cursor_shoot_Forbidden");
        Cursor.SetCursor(cursorTexture, new Vector2(5, 7), CursorMode.Auto);
    }
}
