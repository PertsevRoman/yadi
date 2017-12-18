import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from "@angular/common/http";

type FileType = 'file' | 'dir';

interface Node {
  text: string;
  preview?: string;
  path?: string;
  nodes?: Node[];
  type: FileType;
}

interface Video {
  id: string;
  thumb: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @ViewChild('cnt') cnt: ElementRef;
  @ViewChild('laster') laster: ElementRef;
  @ViewChild('videoFrame') videoFrame: ElementRef;

  private fsTree: any;
  private modal: JQuery;
  public currentNode: Node;
  public videos: Video[] = [];

  constructor(private httpClient: HttpClient) { }

  ngOnInit(): void {
    this.fsTree = $(this.cnt.nativeElement).treeview(true);
    this.modal = $(this.laster.nativeElement);
  }

  getData() {
    this.httpClient.get('/api/disk-tree').subscribe((nodeList: Node[]) => {
      this.fsTree.treeview({
        data: nodeList
      });

      this.fsTree.treeview('collapseAll', {
        silent: true
      });

      this.fsTree.on('nodeSelected', (event, node: Node) => {
        if (node.type == "file") {
          this.currentNode = node;
          this.modal.modal();
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
    this.httpClient.get('/api/videos').subscribe((videos: any) => {
      this.videos = videos.map(video => {
        return {
          id: video.contentDetails.videoId,
          thumb: video.snippet.thumbnails.default.url
        }
      });
    });
  }

  loadData(currentNode: Node) {
    this.httpClient.post(`/api/get-file`, {
      fileName: currentNode.text,
      fileDir: currentNode.path
    }).subscribe(urlInfo => console.log(urlInfo));
  }

  showVideo(video: Video) {
    this.videoFrame.nativeElement.setAttribute('src', `https://youtube.com/embed/${video.id}`);
  }
}
