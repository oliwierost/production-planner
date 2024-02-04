export interface View {
  name: string;
  headerTopData: Array<string>;
  headerBottomData: Array<{
    field: string;
    headerName: string;
    date: Date;
    editable: boolean;
    sortable: boolean;
    width: number;
    minWidth: number;
  }>;
  cellWidth: number;
}
