import { Component,ChangeDetectionStrategy,Input, Output, EventEmitter, ElementRef, Renderer2 } from '@angular/core';
import { TestcaseInfo } from '../service/userdata.service';

@Component({
  selector: 'app-task-show',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './task-show.component.html',
  styleUrls: ['./task-show.component.scss']
})
export class TaskShowComponent  {
  @Input() task: TestcaseInfo;
  @Output() toshow = new EventEmitter<TestcaseInfo>();
  constructor(
    private el: ElementRef,
    private renderer: Renderer2) {
    }

  public open(): void {
    const url = `${this.task.linktoTest}`;
    const w = screen.width * 0.9;
    const h = screen.height * 0.8;
    const left = (screen.width / 2) - (w / 2);
    const top = (screen.height / 2) - (h / 2);
    const randomnumber = Math.floor((Math.random() * 100) + 1);
    // tslint:disable-next-line:max-line-length
    window.open(url, '_blank', 'PopUp' + randomnumber + ',scrollbars=1,menubar=0,resizable=1,width = ' + w + ', height = ' + h + ', top = ' + top + ', left = ' + left);
  }

  changeselected(mytask){
    const part = this.el.nativeElement.querySelector('.item');
    this.renderer.setStyle(part, 'background-color', 'lightblue');
    this.toshow.emit(mytask);
  }

}
