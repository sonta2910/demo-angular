import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {PageBase} from "src/app/common/shared/pagebase";
import {ColDef} from "ag-grid-community";
import {CustomGridFilter} from "src/app/common/shared/customGridFilter";
import {CustomSetFilterComponent} from "src/app/common/components/custom-set-filter/custom-set-filter.component";
import {DOCUMENT, formatDate} from "@angular/common";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {NgbModal} from "@ng-bootstrap/ng-bootstrap";
import * as moment from "moment";
import {ActionComponent} from "../action/action.component";
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {
  DropdownStatusCellRendererComponent
} from "../dropdown-status-cell-renderer/dropdown-status-cell-renderer.component";
import {HoatDongService} from "./hoat-dong.service";
import {HoatDongModel} from "./hoat-dong.model";

@Component({
  selector: 'hoat-dong-list',
  templateUrl: './hoat-dong.component.html',
  styleUrls: ['./hoat-dong.component.scss']
})
export class HoatDongComponent extends PageBase implements OnInit {
  @ViewChild('contentShowHideColumn') ngContentShowHideColumn: NgbModal;
  @ViewChild('contentImport') ngContentImport: NgbModal;
  @ViewChild('contentInsert') ngContentInsert: NgbModal;
  @ViewChild('contentUpdate') ngContentUpdate: NgbModal;
  @ViewChild('contentHistory') ngContentHistory: NgbModal;
  @ViewChild('filesInput') filesInput: any;
  txtLevel = 1;
  formSearch: FormGroup;
  formUpdate: FormGroup;
  formInsert: FormGroup;
  userList = [];
  rowDataHistory: any[] = [];
  searchModel: any = {};
  public blob: Blob;
  public files: any[] = [];
  private isActive = {
    '1': 'Hoạt động',
    '0': 'Không hoạt động'
  };
  statusList = [
    {
      name: "Tất cả",
      id: ""
    },
    {
      name: "Hoạt động",
      id: "1"
    },
    {
      name: "Không hoạt động",
      id: "0"
    }
  ];
  statusListSaveOrUpdate = [
    {
      name: "Hoạt động",
      id: "1"
    },
    {
      name: "Không hoạt động",
      id: "0"
    }
  ];

  hoatDongLevel1List = [];
  public columnDefs: ColDef[] = [
    {headerName: 'STT', valueGetter: (params) => {
        // @ts-ignore
        return this.pageIndex * 20 + params.node.rowIndex + 1;
      }, width: 20, filter: false}, // Row Number Column
    {
      colId: 'codeLevel1',
      field: 'codeLevel1',
      headerName: "Mã hoạt động cấp 1",
      minWidth: 50,
      filterParams: CustomGridFilter.containsOnlyFilterParams
    },
    {
      colId: 'nameLevel1',
      field: 'nameLevel1',
      headerName: "Hoạt động cấp 1",
      minWidth: 100,
      filterParams: CustomGridFilter.containsOnlyFilterParams
    },
    {
      colId: 'codeLevel2',
      field: 'codeLevel2',
      headerName: "Mã hoạt động cấp 2",
      minWidth: 50,
      filterParams: CustomGridFilter.containsOnlyFilterParams
    },
    {
      colId: 'nameLevel2',
      field: 'nameLevel2',
      headerName: "Hoạt động cấp 2",
      minWidth: 100,
      filterParams: CustomGridFilter.containsOnlyFilterParams
    },
    {
      colId: 'status', field: 'status', headerName: "Trạng thái", width: 100,
      filter: CustomSetFilterComponent,
      filterParams: {
        datasource: [
          {
            name: "Tất cả",
            value: ""
          },
          {
            name: "Hoạt động",
            value: "1"
          },
          {
            name: "Không hoạt động",
            value: "0"
          }
        ]
      },
      cellRenderer: DropdownStatusCellRendererComponent,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: this.extractValues(this.isActive)
      },
      refData: this.isActive,
      editable: false
    },
    {
      colId: 'modifiedDate',
      field: 'modifiedDate',
      headerName: "Ngày cập nhật",
      minWidth: 100,
      filterParams: CustomGridFilter.containsOnlyFilterParams,
      cellRenderer: (data: { value: any; }) => {
        return moment(data.value).format('DD/MM/YYYY HH:mm:ss')
      }
    },
    {
      colId: 'modifiedBy',
      field: 'modifiedBy',
      headerName: "Người cập nhật",
      minWidth: 100,
      filterParams: CustomGridFilter.containsOnlyFilterParams
    },
    {
      colId: 'click', field: 'id', headerName: "Hành động", width: 30, filter: false,
      cellRenderer: ActionComponent,
      cellRendererParams: {
        clicked: (field: any, type: string) => {
          this.onActionClick(field, type);
        }
      },
      type: 'rightAligned'
    }
  ];
  rightAligned: {
    headerClass: 'ag-right-aligned-header',
    cellClass: 'ag-right-aligned-cell'
  }

  public columnDefsHistory: ColDef[] = [
    {
      colId: 'codeLevel1',
      field: 'codeLevel1',
      headerName: "Mã hoạt động cấp 1",
      minWidth: 10,
      filterParams: CustomGridFilter.containsOnlyFilterParams
    },
    {
      colId: 'nameLevel1',
      field: 'nameLevel1',
      headerName: "Hoạt động cấp 1",
      minWidth: 100,
      filterParams: CustomGridFilter.containsOnlyFilterParams
    },
    {
      colId: 'codeLevel2',
      field: 'codeLevel2',
      headerName: "Mã hoạt động cấp 2",
      minWidth: 100,
      filterParams: CustomGridFilter.containsOnlyFilterParams
    },
    {
      colId: 'nameLevel2',
      field: 'nameLevel2',
      headerName: "Hoạt động cấp 2",
      minWidth: 100,
      filterParams: CustomGridFilter.containsOnlyFilterParams
    },
    {
      colId: 'status', field: 'status', headerName: "Trạng thái", width: 100,
      filter: CustomSetFilterComponent,
      filterParams: {
        datasource: [
          {
            name: "Tất cả",
            value: ""
          },
          {
            name: "Hoạt động",
            value: "1"
          },
          {
            name: "Không hoạt động",
            value: "0"
          }
        ]
      },
      cellRenderer: DropdownStatusCellRendererComponent,
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: this.extractValues(this.isActive)
      },
      refData: this.isActive,
      editable: false
    },
    {
      colId: 'modifiedDate',
      field: 'modifiedDate',
      headerName: "Ngày cập nhật",
      minWidth: 100,
      filterParams: CustomGridFilter.containsOnlyFilterParams,
      cellRenderer: (data: { value: any; }) => {
        return moment(data.value).format('DD/MM/YYYY HH:mm:ss')
      }
    },
    {
      colId: 'modifiedBy',
      field: 'modifiedBy',
      headerName: "Người cập nhật",
      minWidth: 50,
      filterParams: CustomGridFilter.containsOnlyFilterParams
    },
    {
      colId: 'action',
      field: 'action',
      headerName: "Mô tả",
      minWidth: 50,
      filterParams: CustomGridFilter.containsOnlyFilterParams,
      cellRenderer: (data: { value: any; }) => {
        let text = '';
        switch (data.value) {
          case 'CREATE': text = 'Tạo mới'; break;
          case 'UPDATE': text = 'Cập nhật'; break;
          default: break;
        }
        return text;
      }
    }
  ];

  constructor(@Inject(DOCUMENT) private document: Document,
              private router: Router,
              private formBuilder: FormBuilder,
              private hoatDongService: HoatDongService,
              private _snackBar: MatSnackBar,
              private modalService: NgbModal) {
    super();
  }

  override ngOnInit(): void {
    this.formSearch = this.formBuilder.group({
      codeLevel1: [''],
      nameLevel1: [''],
      codeLevel2: [''],
      nameLevel2: [''],
      status: [''],
      modifiedBy: [''],
    });
    this.formUpdate = this.formBuilder.group({
      code: [''],
      nameLevel1: ['', [Validators.required, Validators.maxLength(1000)]],
      parentCode: [''],
      nameLevel2: ['', [Validators.required, Validators.maxLength(1000)]],
      status: ['1', Validators.required]
    });

    this.formInsert = this.formBuilder.group({
      parentCode: [''],
      name: ['', [Validators.required, Validators.maxLength(1000)]],
      status: ['1', Validators.required]
    });

    this.columnDefs.forEach((value) => {
      if (value.field != null) {
        let colId = (value.colId === null || value.colId === undefined) ? value.field : value.colId;
        let isHide = (value.hide === null || value.hide === undefined) ? false : value.hide;
        let commentData: { id: string, value?: string, ischecked: boolean } = {
          id: '' + colId,
          value: value.headerName,
          ischecked: !isHide
        };
        let checkCol = this.customFilteredData.filter(x => x.id == colId)[0];
        if (checkCol != null) {
          checkCol.value = '';
        } else {
          if (value.headerName != "") {
            this.customFilteredData.push(commentData)
          }
        }
      }
    });

    this.hoatDongService.getListUser().subscribe(res => {
      this.userList = res.map((val: { email: any; userId: any; fullName: any; }) => {
        return {
          id: val.email,
          userId: val.userId,
          name: val.fullName,
        };
      });
      // @ts-ignore
      this.userList.unshift({id: "", userId: "Tất cả", name: "Tất cả"})
    });
  }

  override loadData(params: string) {
    this.search();
  }

  doClear() {
    this.formSearch.controls.codeLevel1.setValue('');
    this.formSearch.controls.nameLevel1.setValue('');
    this.formSearch.controls.codeLevel2.setValue('');
    this.formSearch.controls.nameLevel2.setValue('');
    this.formSearch.controls.status.setValue('');
    this.formSearch.controls.modifiedBy.setValue('');
    this.search();
  }

  search() {
    this.searchModel = {};
    this.searchModel.page = this.pageIndex + 1;
    if (this.formSearch.value.codeLevel1) this.searchModel.codeLevel1 = this.formSearch.value.codeLevel1.trim();
    if (this.formSearch.value.nameLevel1) this.searchModel.nameLevel1 = this.formSearch.value.nameLevel1.trim();
    if (this.formSearch.value.codeLevel2) this.searchModel.codeLevel2 = this.formSearch.value.codeLevel2.trim();
    if (this.formSearch.value.nameLevel2) this.searchModel.nameLevel2 = this.formSearch.value.nameLevel2.trim();
    if (this.formSearch.value.status) this.searchModel.status = this.formSearch.value.status;
    if (this.formSearch.value.modifiedBy) this.searchModel.modifiedBy = this.formSearch.value.modifiedBy;
    this.doSearch(this.searchModel);
  }

  doSearch(params: string) {
    this.hoatDongService.search(params).subscribe(
      response => {
        this.length = response.totalElements;
        this.rowData = response.content;
      },
      err => {
        if (err.error != null) {
          this.alertError(err.error?.message);
        } else {
          this.alertError(err);
        }
      }
    );
  }

  checkboxChanged(colId: any, event: any) {
    this.gridColumnApi.setColumnVisible(colId, event);
  }

  onActionClick(data: any, type: string) {
    if (type == 'HISTORY') {
      this.openModalHistory(data);
    } else if (type == 'EDIT') {
      this.openModal("Update", data);
    }
  }

  toggleSettingsSidebar(e: Event) {
    e.preventDefault();
    this.document.body.classList.toggle('settings-open');
  }

  paginationChange(paginationDetails: any) {
    console.log('Page Changed: ', paginationDetails);
  }

  doExport() {
    const dateNow = formatDate(new Date(), 'yyyyMMddHHmm', 'en');
    let configModel = {
      codeLevel1: this.formSearch.controls.codeLevel1.value.trim(),
      nameLevel1: this.formSearch.controls.nameLevel1.value.trim(),
      codeLevel2: this.formSearch.controls.codeLevel2.value.trim(),
      nameLevel2: this.formSearch.controls.nameLevel2.value.trim(),
      status: this.formSearch.controls.status.value,
      modifiedBy: this.formSearch.controls.modifiedBy.value,
    }
    this.hoatDongService.export(configModel).subscribe(
      response => {
        this.blob = new Blob([response], {type: 'application/vnd.ms-excel'});
        const downloadURL = window.URL.createObjectURL(this.blob);
        const link = document.createElement('a');
        link.href = downloadURL;
        link.download = 'HoatDong_' + dateNow + '.xlsx';
        link.click();
      },
      err => {
        if (err.error != null) {
          this.alertError(err.error.message);
        } else {
          this.alertError(err);
        }
      });
  }

  doDownloadTemplate() {
    this.hoatDongService.downloadTemplateImport().subscribe(res => {
      this.blob = new Blob([res], {type: 'application/vnd.ms-excel'});
      const downloadURL = window.URL.createObjectURL(this.blob);
      const link = document.createElement('a');
      link.href = downloadURL;
      link.download = 'config_hoat_dong_template.xlsx';
      link.click();
    });
  }

  doValidateFileImport() {
    if (this.files.length == 0) {
      this.alertWarning("Vui lòng chọn file dữ liệu!");
    } else {
      const formData = new FormData();
      formData.append("file", this.files[0]);
      this.hoatDongService.validateImport(formData).subscribe(
        (data: any) => {
          if (data.message_code == "000") {
            this.alertSussess(data.message_desc);
          } else {
            this.alertSussess(data.message_desc);
            const dateNow = formatDate(new Date(), 'yyyyMMddHHmmss', 'en');
            const mediaType = 'data:application/vnd.ms-excel;base64,';
            const a = document.createElement('a');
            a.href = mediaType + data.file_data;
            a.download = 'HoatDongValidateImport-' + dateNow + '.xlsx';
            a.textContent = 'Download file!';
            a.click();
          }
        },
        (err: any) => {
          if (err.error != null) {
            this.alertError(err.error.message);
          } else {
            this.alertError(err);
          }
        }
      );
    }
  }

  doImport() {
    if (this.files.length == 0) {
      this.alertWarning("Vui lòng chọn file dữ liệu!");
    } else {
      const formData = new FormData();
      formData.append("file", this.files[0]);
      this.hoatDongService.import(formData).subscribe(
        (data: any) => {
          if (data.message_code == "000") {
            this.alertSussess(data.message_desc);
          } else {
            this.alertSussess(data.message_desc);
            const dateNow = formatDate(new Date(), 'yyyyMMddHHmmss', 'en');
            const mediaType = 'data:application/vnd.ms-excel;base64,';
            const a = document.createElement('a');
            a.href = mediaType + data.file_data;
            a.download = 'HoatDongImportError-' + dateNow + '.xlsx';
            a.textContent = 'Download file!';
            a.click();
          }
        },
        (err: any) => {
          if (err.error != null) {
            this.alertError(err.error.message);
          } else {
            this.alertError(err);
          }
        }
      );
    }
  }

  onFileChange(pFileList: File[]) {
    if (pFileList.length > 1) {
      this.alertError("Chỉ được phép upload 1 file duy nhất theo mẫu file template");
      return;
    }
    this.files = [];
    Array.from(pFileList).forEach(file => this.files.push(file));
  }

  deleteFile(f: File) {
    this.files = this.files.filter(function (w) {
      return w.name != f.name
    });
    this._snackBar.open("Xóa file thành công", 'Đóng', {
      duration: 2000,
    });
  }

  doInsert() {
    let model = new HoatDongModel(
      this.formInsert.controls.name.value,
      this.formInsert.controls.parentCode.value,
      this.formInsert.controls.status.value,
    );
    this.hoatDongService.create(model).subscribe(
      data => {
        this.alertSussess('Thêm mới thành công');
        this.resetModal('Insert');
        this.modalService.dismissAll();
        this.search();
      },
      err => {
        if (err.error != null) {
          this.alertError(err.error.message);
        } else {
          this.alertError(err);
        }
      }
    );
  }

  doUpdate() {

  }

  openModal(action: any, data?: any) {
    switch (action) {
      case "ShowHideColumn" : this.modalService.open(this.ngContentShowHideColumn, {size: 'sm'}); break;
      case "Import" : this.modalService.open(this.ngContentImport, {size: 'md'}); break;
      case "Insert" :
        this.txtLevel = data;
        this.modalService.open(this.ngContentInsert, {size: 'md'});
        break;
      case "Update" : this.modalService.open(this.ngContentUpdate, {size: 'md'}); break;
      default: break;
    }

    if (this.txtLevel == 1) {
      this.formInsert.controls.parentCode.clearValidators();
      this.formInsert.controls.parentCode.updateValueAndValidity();
    } else {
      this.formInsert.controls.parentCode.clearValidators();
      this.formInsert.controls.parentCode.setValidators(Validators.required);
      this.formInsert.controls.parentCode.updateValueAndValidity();
      this.hoatDongService.getDropdownLevel1().subscribe(res => {
        this.hoatDongLevel1List = res.map((val: { code: any; name: any; }) => {
          return {
            id: val.code,
            name: val.code + ' - ' +  val.name,
          };
        });
      });
    }
  }

  resetModal(action: any) {
    if (action == 'Insert') {
      this.formInsert.controls.name.setValue('');
      this.formInsert.controls.parentCode.setValue('');
      this.formInsert.controls.status.setValue('1');
    }
  }

  openModalHistory(id: any) {
    this.hoatDongService.searchHistory(id).subscribe(
      response => {
        this.rowDataHistory = response;
        this.modalService.open(this.ngContentHistory, {size: 'xl'});
      },
      err => {
        if (err.error != null) {
          this.alertError(err.error?.message);
        } else {
          this.alertError(err);
        }
      }
    );
  }

  isFieldValidate(formValid: FormGroup, typeValid: string, fieldName: string) {
    if (typeValid == 'required') {
      return formValid.get(fieldName)?.errors?.required && (formValid.get(fieldName)?.dirty || formValid.get(fieldName)?.touched)
    }

    if (typeValid == 'maxlength') {
      return formValid.get(fieldName)?.errors?.maxlength;
    }
  }
}
