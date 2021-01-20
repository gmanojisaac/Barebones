import { TreeData} from '../nested-tree.component';
import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-delete-node',
  templateUrl: './delete-node.component.html',
  styleUrls: ['./delete-node.component.scss']
})
export class DeleteNodeComponent {
  @Output() deletedNode = new EventEmitter;
  @Input() currentNode: TreeData;

  deleteNode() {
    this.deletedNode.emit(this.currentNode);
  }
/*
.delete-btn {
    cursor: pointer;
    position: relative;
    left: 89%;
    font-size: 18px;
  }
  */
}
