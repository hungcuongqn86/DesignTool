import {Injectable, NgZone} from '@angular/core';
import {Observable} from 'rxjs/Rx';
import {ispApiUrl} from '../lib/const';
import {DialogService} from 'ng2-bootstrap-modal';
import {LoadingxComponent} from '../public/loading.component';

@Injectable()
export class UploadService {
    private progress$: Observable<number>;
    private progressObserver: any;
    public progressObj = {'progress': 0};
    private dlLoad;

    constructor(private dialogService: DialogService, private zone: NgZone) {
        this.progress$ = new Observable(observer => {
            this.progressObserver = observer;
        });
    }

    public getObserver(): Observable<number> {
        return this.progress$;
    }

    public startLoad() {
        const progSubs = this.getObserver().subscribe(progress => {
            this.zone.run(() => {
                // console.log(progress);
            });
            if (progress === 100) {
                progSubs.unsubscribe();
            }
        });

        this.dlLoad = this.dialogService.addDialog(LoadingxComponent, {
            status: '',
            progress: this.progressObj
        }).subscribe(() => {
        });
    }

    public endLoad() {
        this.dlLoad.unsubscribe();
        this.progressObj.progress = 0;
    }

    public makeFileRequest(files: File[]): Observable<any> {
        return Observable.create(observer => {
            const url = ispApiUrl + `storev2`;
            const formData: FormData = new FormData(),
                xhr: XMLHttpRequest = new XMLHttpRequest();

            for (let i = 0; i < files.length; i++) {
                formData.append('uploads[]', files[i], files[i].name);
            }

            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if ((xhr.status === 200) || (xhr.status === 201)) {
                        observer.next(JSON.parse(xhr.response));
                        observer.complete();
                    } else {
                        observer.error(xhr.response);
                    }
                }
            };

            xhr.upload.onprogress = (event) => {
                this.progressObj.progress = Math.round(event.loaded / event.total * 100);
                this.progressObserver.next(this.progressObj);
            };

            xhr.open('POST', url, true);
            xhr.send(formData);
        });
    }
}
