import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";

interface Node {
  text: string;
  preview?: string;
  path?: string;
  nodes?: Node[];
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

      this.fsTree.treeview('collapseAll', {
        silent: true
      });

      this.fsTree.on('nodeSelected', (event, node) => {
        if (node.preview) {
          console.log(node.preview);
        }
      });
    });
  }

  getYoutubeUrl() {
    this.httpClient.get('/api/youtube-url').subscribe((urlData: any) => {
      let url = urlData.url;
      window.open(url, `Yandex Auth`, `height=800,width=600`);
    });
  }

  getYoutubeVideos() {
    this.httpClient.get('/api/videos').subscribe((channels: any) => {
      console.log(channels);
    });
  }
}
