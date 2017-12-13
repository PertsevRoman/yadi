import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('cnt') cnt: ElementRef;
  private fsTree: any;


  constructor(private httpClient: HttpClient) {
  }

  ngOnInit(): void {
    this.fsTree = $(this.cnt.nativeElement).treeview(true);

    this.getData();
  }

  runAuthorize() {
    window.open('https://oauth.yandex.ru/authorize?response_type=token&client_id=1a6501c875d04e48b596a877fd0a1716', 'Yandex Auth', '"height=800,width=600"');
  }

  private getData() {
    this.httpClient.get('/api/disk-tree').subscribe(data => {
      this.fsTree.treeview(data);
    });
  }
}
