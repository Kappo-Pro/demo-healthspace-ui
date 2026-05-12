import { User } from '@types'

export interface optionsListType {
    label: string
    value: string
}

// export interface User extends IDBUser, IFAUser {
export interface tableDataType extends User {
    label?: string
    tool?: string;
    delete?: boolean;
    edit?: boolean;
    isSelected?: boolean;
}

export interface headerType {
    name: string
    helperText: string
    sort: boolean
    key: string
}

export interface tablePropsType {
    tableData?: tableDataType[] | []
    header?: headerType[] | []
    rowSelect?: boolean
    title?: string
    countLabel?: string
    onSort: (key: string) => void
    onSelect?: (selectedArray: tableDataType[]) => void
    onActionClick?: (key: string, selectedArray: tableDataType[]) => void
    buttonLabel?: string
    onButtonClick?: () => void | undefined
    onSelectDropdown?: (id: string, values: string[]) => void | undefined
    optionsList?: optionsListType[] | []
    placeholder?: string
    total?: number
    showTotal?: boolean
}