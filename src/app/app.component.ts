import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";

interface Node {
  text: string;
  nodes?: Node[]
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('cnt') cnt: ElementRef;
  private fsTree: any;

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.fsTree = $(this.cnt.nativeElement).treeview(true);
  }

  getData() {
    this.httpClient.get('/api/disk-tree').subscribe((nodeList: Node[]) => {
      this.fsTree.treeview({
        data: nodeList
      });
    });
  }
}
