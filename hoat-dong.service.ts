import {Injectable} from "@angular/core";
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {CONST} from "src/app/common/shared/const";
import {CommonUtils} from "../common-utils.service";
import {HoatDongModel} from "./hoat-dong.model";

@Injectable({
  providedIn: 'root'
})
export class HoatDongService {
  credentials: any = {};
  constructor(private http: HttpClient) { }

  search(data?: any): Observable<any> {
    this.credentials = Object.assign({}, data);
    const searchData = CommonUtils.convertData(this.credentials);
    const buildParams = CommonUtils.buildParams(searchData);
    return this.http.get(CONST.API_URL + 'category-actions/search', { params: buildParams });
  }

  searchHistory(sysCategoryId: any): Observable<any> {
    return this.http.get(CONST.API_URL + `category-actions/history/${sysCategoryId}`);
  }

  create(hoatDongModel: HoatDongModel): Observable<any> {
    return this.http.post(CONST.API_URL + "category-actions", hoatDongModel, CONST.httpOptions);
  }

  update(configModel: any): Observable<any> {
    return this.http.put(CONST.API_URL + "category-actions", configModel, CONST.httpOptions);
  }

  export(configModel: any): Observable<any> {
    return this.http.post(CONST.API_URL + 'category-actions/export', configModel, {responseType: 'blob'});
  }

  downloadTemplateImport(): Observable<any> {
    return this.http.get(CONST.API_URL + 'category-actions/import/template', { responseType: 'blob' });
  }

  validateImport(req: any): Observable<any> {
    return this.http.post(CONST.API_URL + "category-actions/import/validate", req, {responseType: 'json'});
  }

  import(req: any): Observable<any> {
    return this.http.post(CONST.API_URL + "category-actions/import", req, {responseType: 'json'});
  }

  getDropdownLevel1(): Observable<any> {
    return this.http.get(CONST.API_URL + 'category-actions/dropdown-level1');
  }

  getListUser() : Observable<any> {
    return this.http.get(CONST.API_URL_TEST + 'users');
  }
}
