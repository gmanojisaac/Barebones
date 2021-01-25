import { TreeData} from '../nested-tree.component';
import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-delete-node',
  templateUrl: './delete-node.component.html',
  styleUrls: ['./delete-node.component.scss']
})
export class DeleteNodeComponent {
  @Input() currentNode: TreeData;
  @Output() deletedNode = new EventEmitter;

  deleteNode() {
    this.deletedNode.emit({currentNode: this.currentNode});
  }
}
