# Command Stack API

  The CommandStack is a JavaScript class that provides the functionality to support do/undo/redo of commands.  It maintains an internal stack of commands with a cursor that moves up and down when commands are undone or redone. Commands are also Javascript classes that implement a simple interface.

  The canvas-controller creates an instance of the command stack. Common-canvas provides command objects for each of the commands that are performed by the user, such as: create node, delete comment, link nodes together, etc.

  To allow the user to activate the undo and redo actions, common-canvas provides undo/redo options in its default context menu, on the default toolbar and via keystrokes ctrl+z (undo) and ctrl+shift+z (redo). You can implement your own undo and redo UI if required, using the API.

   The canvas-controller provides the following methods to allow the application to control the command stack:

```js
   do(command) - push the command onto the command stack and then invoke command.do()
   undo() - pop a command from the command stack and then invoke command.undo()
   redo() - push last undo command onto the command stack and then invoke command.redo()
   canUndo() - returns true if there is a command on the command stack that can be undone.
   canRedo() - returns true if there is a command on the command stack that can be redone.
   getUndoLabel() - returns the label for the next command to be undone.
   getRedoLabel() - returns the label for the next command to be redone.
   clearCommandStack() - empties the command stack
```

Each command that is added to the command stack is a Javascript class that needs to implement these methods:

```js
   constructor()
   do()
   undo()
   redo()
   getLabel()
```

constructor() - Initial setup

do() - Performs all actions necessary to execute the command

undo() - Performs all actions necessary to reverse the actions performed in do()

redo() - Performs all actions necessary to re-execute the command. For some commands this is the same as do() but others it is different.

getLabel() - Returns a label that descibes the action.


  Here is some sample code that shows how a create-node command might be written:

```js
   export default class CreateNodeAction extends Action {

        constructor(data, canvasController) {
            super(data);
            this.canvasController = canvasController;
            this.newNode = createNode(data);
         }

         do() {
            this.canvasController.addNode(this.newNode);
         }

         undo() {
            this.canvasController.deleteNode(this.newNode.id);
         }

         redo() {
            this.canvasController.addNode(this.newNode);
         }

         getLabel() {
            return "Add 1 node"
         }
   }
```

   Here is an example showing how to create a command action and push it on the stack using the canvas-conttoller:

```js
   const command = new CreateNodeAction(data);
   this.canvasController.do(command);
```

### Exported common-canvas action classes

Some of the internal action classes have been exported from common-canvas and can be extended with additional
functionality if needed. The classes that are exported are:

* CreateAutoNodeAction
* CreateNodeAction
* CreateNodeLinkAction
* DeleteObjectsAction
* DisconnectObjectsAction
* PasteAction

The constructors for these classes all take the same two parameters. The `data` object that descrbes the command
and a reference to `canvas controller`.

Applications can extend these classes to augment their basic behavior with application specific behavior. It is the application’s responsibility to add the extended object to the command stack when the user performs the corresponding action.

Although there are no plans to alter the internal workings of these six command action classes, there is always the chance that a change in the future might alter a field name or two. If you extend these classes, it is therefore recommended that you have sufficient regression tests for your extensions that would highlight such a problem, should it occur.



