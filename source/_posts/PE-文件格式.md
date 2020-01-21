---
title: PE 文件格式
toc: true
top: false
cover: false
password: false
comment: true
date: 2018-12-22 13:34:53
categories: 二进制
img: https://s2.ax1x.com/2020/01/20/1Fpf4U.jpg
tags:
  - PE
  - 文件格式
  - 参考
summary: Portable Excutable，可移植性可执行文件，是微软公司设计的在 Windows 系统下可执行文件的格式，因在开发时被定义为各种结构体，故通常称 PE结构。
---

## 简述
PE 格式是由 *Unix* 中的 COFF 格式修改而来的，在 Windows 环境中，PE 格式也称为 *PE/COFF 格式*

在 Win64 系统上运行的原生 64 位应用程序，其 PE 格式称为 *PE32+*，与 PE 不同之处基本只是在 PE 头 *IMAGE_NT_HEADERS*

### 常见格式
- EXE
- DLL（动态链接库）
- SYS（驱动程序）
- COM
- OCX
- EFI

### 文件结构概览

```
|——IMAGE_DOS_HEADER                     | +40h
 |——e_magic                 4D 5A
 |——xxx
 |——e_lfanew   xx xx xx xx
|——DOS Stub
|——IMAGE_NT_HEADERS                     |
 |——Signature               50 45 00 00 | +04h
 |——IMAGE_FILE_HEADER                   | +14h
 |——IMAGE_OPTIONAL_HEADER               | +224h/+240h
  |——IMAGE_DATA_DIRECTORY               |  01h x 16
|——IMAGE_SECTION_HEADER                 | +28h x (n + 1)
|——SECTIONs
```

## 基本概念
1. EP
   > Entry Pointer，入口点

   EP是一个RVA，EP + Imagebase = 入口点的VA
   通常情况下，EP指向的不是main函数
2. OEP
   > Original Entery Pointer，原始入口点
3. INT
   > Import Name Table，导入名称表，一个结构体数组，详见 **导入表**
4. 对齐
   文件对齐的最小单位是磁盘扇区的单位，0x0200 字节
   内存对齐的最小单位是 CPU 内存分页大小，Win32 0x1000 字节，即 4 KiB
5. 节偏移
   内存中数据节相对于装载基址的偏移量(*RVA*)和文件中数据节的偏移量(*FOA*)的差异称为节偏移

### 地址
1. _ImageBase_
   基地址，磁盘中的文件加载到内存中时可以加载到任意位置，即程序的基址
   建议装载地址，详见 **重定位表**

   - EXE 默认加载基址是 `0x00400000h`
   - DLL 默认加载基址是 `0x10000000h`

   > 需要注意的是基地址不是程序的入口点
2. VA
   > 虚拟地址，Virtual Address

   程序运行时被加载到 **内存** 中的地址
3. RVA
   > 相对虚拟地址，Relative Virtual Address

   是在内存中相对于 **映射基地址** (EXE 文件为*ImageBase*)的偏移量
4. FOA
   > 文件偏移地址，File Offset Address

   当PE文件储存在某个磁盘当中的时候，某个数据的位置相对于 **文件头** 的偏移量
5. 地址转换
   1. VA = ImageBase + RVA
   2. FOA = VA - ImageBase - 节偏移
   3. FOA = RVA - 节偏移

## MS-DOS Header
PE 文件第一个字节起始于 MS-DOS 头部，该头部被定义为 *IMAGE_DOS_HEADER*
DOS 头部为了兼容 DOS 系统而遗留的，最后一个字节给出了 PE 头的地址

### 结构体 IMAGE_DOS_HEADER
```C
typrdef struct _IMAGE_DOS_HEADER {
    WORD   e_magic;          // +0000h - EXE标志，"MZ"
    WORD   e_cblp;           // +0002h - 最后（部分）页中的字节数
    WORD   e_cp;             // +0004h - 文件中的全部和部分页数
    WORD   e_crlc;           // +0006h - 重定位表中的指针数
    WORD   e_cparhdr;        // +0008h - 头部尺寸，以段落为单位
    WORD   e_minalloc;       // +000ah - 所需的最小附加段
    WORD   e_maxalloc;       // +000ch - 所需的最大附加段
    WORD   e_ss;             // +000eh - 初始的SS值（相对偏移量）
    WORD   e_sp;             // +0010h - 初始的SP值
    WORD   e_csum;           // +0012h - 补码校验值
    WORD   e_ip;             // +0014h - 初始的IP值
    WORD   e_cs;             // +0016h - 初始的CS值
    WORD   e_lfarlc;         // +0018h - 重定位表的字节偏移量
    WORD   e_ovno;           // +001ah - 覆盖号
    WORD   e_res[4];         // +001ch - 保留字00
    WORD   e_oemid;          // +0024h - OEM标识符
    WORD   e_oeminfo;        // +0026h - OEM信息
    WORD   e_res2[10];       // +0028h - 保留字
    LONG   e_lfanew;         // +003ch - PE头相对于文件的偏移地址
  } IMAGE_DOS_HEADER, *IMAGE_DOS_HEADER;
```

### 字段解析
1. `e_magic`
    - 占用 **2** 字节
    - 值：**`4D 5A`**
    - ASCII：**`MZ`**
    - DOS 头的标记位
    - 即"MZ" Header，_Mark Zbikowski_ 的姓名缩写，他是最初的 MS-DOS 设计者之一
    - *Winnt.h* 宏定义如下
       ```C
       # define IMAGE_DOS_SIGNATURE 0x5A4D  // MZ
       ```
2. `e_lfanew`
   - 占用 **4** 字节
   - 这是一个 RVA，代表 PE 文件头到基址的偏移量，可用来找到 PE 文件头的位置

### DOS Stub
- 当 Win32 程序在 DOS 下执行时会输出 `This program cannot be run in DOS mode`
- 该部分可有可无，可填充其他内容，一般由编译器生成
- `e_lfanew` 到 `e_lfanew` 所指出的地址之间的内容

## PE Header
- PE 头由 *IMAGE_NT_HEADERS* 结构体定义
    - *IMAGE_NT_HEADERS* 是一个宏定义，有 **32位** 和 **64位** 之别
        ```C
        #ifdef _WIN64
        typedef IMAGE_NT_HEADER64   IMAGE_NT_HEADER;
        typedef PIMAGE_NT_HEADER64  PIMAGE_NT_HEADER;
        #else
        typedef IMAGE_NT_HEADER32   IMAGE_NT_HEADER;
        typedef PIMAGE_NT_HEADER32  PIMAGE_NT_HEADER;
        #endif
        ```
- 起始地址由 `IMAGE_DOS_HEADER.lfanew` 给出
- 真正用来装载 Windows 程序

### 结构体 IMAGE_NT_HEADERS
```C
typedef struct _IMAGE_NT_HEADERS {
    DWORD Signature;                        // +0000h - PE00
    IMAGE_FILE_HEADER FileHeader;           // +0004h - PE 标准头
    IMAGE_OPTIONAL_HEADER32 OptionalHeader; // +0018h - PE 选项头
 // IMAGE_OPTIONAL_HEADER64 OptionalHeader;
}
```

### Signature
- 判断是否是 PE 文件
- 占用 **4** 字节
- ASCII：**`PE00`**
- 值：**`00 00 45 50`**
- 宏定义如下
    ```C
    #define IMAGE_NT_SIGNATURE 0x00004550   // PE00
    ```

### FileHeader
- 描述文件相关信息
- **文件头** 由 `IMAGE_DOS_HEADER.e_lfanew` 指定地址后的 20 个字节
- 结构体大小定义如下
    ```C
    #define IMAGE_SIZEOF_FILE_HEADER    20
    ```

#### 结构体 IMAGE_FILE_HEADER
```C
typedef struct _IMAGE_FILE_HEADER {
    WORD    Machine;              // +0004h - 运行平台
    WORD    NumberOfSections;     // +0006h - PE中节的数量
    DWORD   TimeDateStamp;        // +0008h - 文件创建日期和时间
    DWORD   PointerToSymbolTable; // +000ch - 指向符号表
    DWORD   NumberOfSymbols;      // +0010h - 符号表中的符号数量
    WORD    SizeOfOptionalHeader; // +0014h - 选项头结构的长度
    WORD    Characteristics;      // +0016h - 文件属性
}
```

#### 字段解析
1. `Machine`
    - `0x0000`：适用于任何类型处理器
    - `0x01D3`：Matsushita AM33 处理器
    - `0x8664`：x64 处理器
    - `0x01C0`：ARM 小端处理器
    - `0x0EBC`：EFI 字节码处理器
    - **`0x014C`：Intel 32**
    - **`0x0200`：Intel 64**
    - `0x9041`：Mitsubishi M32R 小端处理器
    - `0x0266`：MIPS16 处理器
    - `0x366`：带 FPU 的 MIPS 处理器
    - `0x466`：带 FPU 的 MIPS16 处理器
    - `0x1F0`：PowerPC 小端处理器
    - `0x1F1`：带符点运算支持的 PowerPC 处理器
    - `0x166`：MIPS 小端处理器
    - `0x1A2`：Hitachi SH3 处理器
    - `0x1A3`：Hitachi SH3 DSP 处理器
    - `0x1A6`：Hitachi SH4 处理器
    - `0x1A6`：Hitachi SH5 处理器
    - `0x1C2`：Thumb 处理器
    - `0x169`：MIPS 小端 WCE v2 处理器
2. `TimeDateStamp`：自格林尼治 *1970.1.1* 以来时间
3. `SizeOfOptionalHeader`：指定 **IMAGE_OPTIONAL_HEADER** 结构体大小，也是 **32位** 和 **64位** 的区别
4. `Characteristics`：指定该文件类型
    - 0	表明此文件不包含基址重定位信息，因此必须被加载到其首选基地址上。基地址不可用则报错
    - 1	表明此镜像文件是合法的
    - 2	保留，必须为 0
    - 3 保留，必须为 0
    - 4 保留，必须为 0
    - 5	应用程序可以处理大于 2GB 的地址
    - 6	保留，必须为 0
    - 7	保留，必须为 0
    - 8	机器类型基于 32 位体系结构
    - 9	调试信息已经从此镜像文件中移除
    - 10 如果此镜像文件在可移动介质上，完全加载它并把它复制到交换文件中。几乎不用
    - 11 如果此镜像文件在网络介质上，完全加载它并把它复制到交换文件中。几乎不用
    - 12 此镜像文件是系统文件，而不是用户程序
    - 13 此镜像文件是 DLL
    - 14 此文件只能运行于单处理器机器上
    - 15 保留，必须为 0

### OptionalHeader
- 选项头，通常称为 “可选头”
- 管理 PE 文件装载时所需的文件
- 宏定义如下
    ```C
    #ifdef _WIN64
    typedef IMAGE_OPTIONAL_HEADER64             IMAGE_OPTIONAL_HEADER;
    typedef PIMAGE_OPTIONAL_HEADER64            PIMAGE_OPTIONAL_HEADER;
    #define IMAGE_SIZEOF_NT_OPTIONAL_HEADER     IMAGE_SIZEOF_NT_OPTIONAL64_HEADER
    #define IMAGE_NT_OPTIONAL_HDR_MAGIC         MAGE_NT_OPTIONAL_HDR64_MAGIC
    #else
    typedef IMAGE_OPTIONAL_HEADER32             IMAGE_OPTIONAL_HEADER;
    typedef PIMAGE_OPTIONAL_HEADER32            PIMAGE_OPTIONAL_HEADER;
    #define IMAGE_SIZEOF_NT_OPTIONAL_HEADER     IMAGE_SIZEOF_NT_OPTIONAL32_HEADER
    #define IMAGE_NT_OPTIONAL_HDR_MAGIC         IMAGE_NT_OPTIONAL_HDR32_MAGIC
    #endif
    ```
- 大小由 `IMAGE_FILE_HEADER.SizeOfOptionalHeader` 给出
    - 宏定义如下
        ```C
        #define IMAGE_SIZEOF_NT_OPTIONAL32_HEADER 224
        #define IMAGE_SIZEOF_NT_OPTIONAL64_HEADER 240
        #define IMAGE_NT_OPTIONAL_HDR32_MAGIC   0x10b
        #define IMAGE_NT_OPTIONAL_HDR64_MAGIC   0x20b
        ```
    - 32位：`0x00E0` 字节，即 224 字节
    - 64位：`0x00F0` 字节，即 240 字节
    - 区别：整体增加 16 字节
        1. `BaseOfData` 64 位版本不存在
        2. `ImageBase`、`SizeOfStackReserve`、`SizeOfStackCommit`、`SizeOfHeapReserve`、`SizeOfHeapCommit` 字段由 4 字节变为 8 字节
- 通常结束于 `.text` 节之前

#### 结构体 IMAGE_OPTIONAL_HEADER
```C
typedef struct _IMAGE_OPTIONAL_HEADER {
    //
    // Standard fields.
    //

    WORD    Magic;                 // +0018h - 指定文件标识
    BYTE    MajorLinkerVersion;    // +001ah - 链接器主版本号
    BYTE    MinorLinkerVersion;    // +001bh - 连接器次版本号
    DWORD   SizeOfCode;            // +001ch - 所有含代码的节的总大小
    DWORD   SizeOfInitializedData;   // +0020h - 所有含已初始化数据的节的总大小
    DWORD   SizeOfUninitializedData; // +0024h - 所有含未初始化数据的节的大小
    DWORD   AddressOfEntryPoint;     // +0028h - 程序执行入口RVA
    DWORD   BaseOfCode;            // +002ch - 代码节的起始RVA
    DWORD   BaseOfData;            // +0030h - 数据节的起始RVA
// 该字段 64 位版本将不存在
    //
    // NT additional fields.
    //

    DWORD   ImageBase;             // +0034h - 程序的建议装载地址
//ULONGLONG ImageBase;
    DWORD   SectionAlignment;      // +0038h - 内存中节的对齐粒度
    DWORD   FileAlignment;         // +003ch - 文件中节的对齐粒度
    WORD    MajorOperatingSystemVersion; // +0040h - 操作系统主版本号
    WORD    MinorOperatingSystemVersion; // +0042h - 操作系统次版本号
    WORD    MajorImageVersion;     // +0044h - 该PE主版本号
    WORD    MinorImageVersion;     // +0046h - 该PE次版本号
    WORD    MajorSubsystemVersion; // +0048h - 子系统的主版本号
    WORD    MinorSubsystemVersion; // +004ah - 子系统的次版本号
    DWORD   Win32VersionValue;     // +004ch - 保留
    DWORD   SizeOfImage;           // +0050h - 内存中的整个PE映像大小
    DWORD   SizeOfHeaders;         // +0054h - 所有头+节表的大小
    DWORD   CheckSum;              // +0058h - 校验和
    WORD    Subsystem;             // +005ch - 文件的子系统
    WORD    DllCharacteristics;    // +005eh - DLL文件特性
    DWORD   SizeOfStackReserve;    // +0060h - 初始化时的栈大小
    DWORD   SizeOfStackCommit;     // +0064h - 初始化时实际提交的栈大小
    DWORD   SizeOfHeapReserve;     // +0068h - 初始化时保留的堆大小
    DWORD   SizeOfHeapCommit;      // +006ch - 初始化时实际提交的堆大小
//ULONGLONG SizeOfStackReserve;
//ULONGLONG SizeOfStackCommit;
//ULONGLONG SizeOfHeapReserve;
//ULONGLONG SizeOfHeapCommit;
    DWORD   LoaderFlags;           // +0070h - 与调试有关
    DWORD   NumberOfRvaAndSizes;   // +0074h - 下面的数据目录结构数量
    IMAGE_DATA_DIRECTORY DataDirectory[IMAGE_NUMBEROF_DIRECTORY_ENTRIES];
    // +0078h - 数据目录
} IMAGE_OPTIONAL_HEADER, *PIMAGE_OPTIONAL_HEADER;
```

##### 结构体 IMAGE_DATA_DIRECTORY
*IMAGE_DATA_DIRECTORY* 定义如下
```C
typedef struct _IMAGE_DATA_DIRECTORY {
DWORD   VirtualAddress; // +0000h - 数据的起始RVA
DWORD   Size;           // +0004h - 数据块的长度，非准确值
} IMAGE_DATA_DIRECTORY, *PIMAGE_DATA_DIRECTORY;
```

#### 字段解析
1. `Magic`：决定 *IMAGE_OPTIONAL_HEADER* 版本
    Magic | 版本
    ------|----
    0x010B|PE32
    0x020B|PE32+
2. `AddressOfEntryPoint`：程序执行的入口，该地址是一个 RVA，指向执行的第一条代码
3. `ImageBase`：默认加载基址
4. `BaseOfCode`：代码节的起始位置
5. `BaseOfData`：只存在于 **32位** 版本，很多情况下可以为 0
6. `SectionAlignment`：内存中的块对齐值，一般为 `0x1000`_(4096)_ 字节，即 `4KiB`
7. `FileAlignment`：文件中的块对齐值，一般为 `0x200`_(512)_ 字节或 `0x1000`_(4096)_ 字节
8. `SizeOfHeaders`：整个头部即DOS头、PE头以及节表总大小，该值按照 `FileAlignment` 对齐
9. `Subsystem`
    - 0	    未知子系统
    - **1	设备驱动程序和Native Windows进程**
    - **2	图形用户界面子系统，即一般程序**
    - **3	控制台子系统**
    - 7     Posix 字符模式子系统
    - 9	    Windows CE
    - 10    可扩展固件接口（EFI）应用程序
    - 11    带引导服务的 EFI 驱动程序
    - 12    带运行时服务的 EFI 驱动程序
    - 13    EFI ROM 镜像
    - 14    XBOX 子系统
10. `DllCharacteristics`
    - 1	保留，必须为 0
    - 2	保留，必须为 0
    - 3	保留，必须为 0
    - 4	保留，必须为 0
    - 5	官方文档缺失
    - 6	官方文档缺失
    - 7	DLL 可以在加载时被重定位
    - 8	强制进行代码完整性校验
    - 9	镜像兼容于 NX
    - 10 可以隔离，但并不隔离此镜像
    - 11 不使用结构化异常（SE）处理
    - 12 不绑定镜像
    - 13 保留，必须为 0
    - 14 WDM 驱动程序
    - 15 官方文档缺失
    - 16 可以用于终端服务器
11. `NumberOfRvaAndSizes`：数据目录项个数，宏定义如下
    ```C
    #define IMAGE_NUMBEROF_DIRECTORY_ENTRIES 16
    ```
12. `DataDirectory`
    - 该数组定义了 PE 文件中出现的所有不同类型的数据目录信息
    - 数据目录中定义的数据类型有 16 种，下标从 0 开始
    - 下标说明
        - 0 **导出表** 地址下标
        - 1 **导入表** 地址下标
        - 2 **资源表** 地址下标
        - 3 异常表地址下标
        - 4 属性证书数据地址下标
        - 5 基地址 **重定位** 表地址下标
        - 6 调试信息地址索引
        - 7 预留为 0
        - 8 指向全局指针寄存器的值
        - 9 线程局部存储索引
        - 10 加载配置表索引
        - 11 绑定导入表索引
        - 12 **导入函数** 地址表索引
        - 13 延迟导入表索引
        - 14 CLR 运行时头部数据索引
        - 15 系统保留

## Directory Section
- 在 *IMAGE_OPTIONAL_HEADER* 之后，由多个节表项(*IMAGE_SECTION_HEADER*)组成
- 每个节表项记录了 PE 中与某个特定的节有关的信息，如节的属性、节的大小、在文件和内存中的起始位置等
- 节表中节的数量由 *IMAGE_FILE_HEADER.NumberOfSection* 字段来定义
- 结构体大小定义如下
    ```C
    #define IMAGE_SIZEOF_SECTION_HEADER    40
    ```

### 常见命名
节区名称     | 描述
------------|-------------------------------
`.text`     | 包含 CPU 指令，唯一包含代码的节
`.data`     | 可 **读写** 的数据，存放全局变量或静态变量
`.rdata`    | **全局** 可访问的 **只读** 数据
`.rodata`   |
`.idata`    | 显示和存储导入函数，如果不存在则存放于 `.rdata`
`.edata`    | 显示和存储导出数据，如果不存在则存放于 `.rdata`
`.pdata`    | 只存在于 64位 可执行文件，处理异常信息
`.rsrc`     | 存放程序用到的所有资源，如图表，菜单等
`.reloc`    | 包含重定位信息
`.bss`      | 未初始化数据区
`.crt`      | 用于支持C++运行时库所添加的数据
`.tls`      | 存储线程局部变量
`.sdata`    | 包含相对于可被全局指针定位的可读写数据
`.srdata`   | 包含相对于可被全局指针定位的只读数据
`.debug$S`  | 包含OBJ文件中的Codeview格式符号
`.debug$T`  | 包含OBJ文件中的Codeview格式类型的符号
`.debug$P`  | 包含使用预编译头时的一些信息
`.drectve`  | 包含编译时的一些链接命令
`.comment`  |
`.didat`    | 包含延迟装入的数据

### 结构体 IMAGE_SECTION_HEADER
```C
#define IMAGE_SIZEOF_SHORT_NAME    8

typedef struct _IMAGE_SECTION_HEADER {
    BYTE    Name[IMAGE_SIZEOF_SHORT_NAME]; // +0000h - 节名
    union {
            DWORD   PhysicalAddress;
            DWORD   VirtualSize;
    } Misc;                        // +0008h - 节区的尺寸
    DWORD   VirtualAddress;        // +000ch - 节区的RVA地址
    DWORD   SizeOfRawData;         // +0010h - 在文件中对齐后的大小
    DWORD   PointerToRawData;      // +0014h - 在文件中的偏移
    DWORD   PointerToRelocations;  // +0018h - 在OBJ文件中使用
    DWORD   PointerToLinenumbers;  // +001ch - 行号表的位置（调试用）
    WORD    NumberOfRelocations;   // +0020h - 在OBJ文件中使用
    WORD    NumberOfLinenumbers;   // +0022h - 行号表中行号的数量
    DWORD   Characteristics;       // +0024h - 节的属性
} IMAGE_SECTION_HEADER，*PIMAGE_SECTION_HEADER;
```

### 字段解析
1. `Name`：节表项名称，长度为 8 的 ASCII 码字符，常用 `.` 起始命名
2. `Characteristics`
    - 1、2、3、4、5 已经废除
    - **6 此节包含可执行代码 `.text`**
    - **7 此节包含已初始化的数据 `.data`**
    - **8 此节包含未初始化的数据 `.bss`**
    - 9、10、11、12、13、14、15 已经废除
    - 16 此节包含通过全局指针（GP）来引用的数据
    - 17、18、19、20、21、22、23、24 已经废除
    - 25 此节包含扩展的重定位信
    - 26 此节可以在需要时被丢弃
    - 27 此节不能被缓存
    - 28 此节不能被交换到页面文件中
    - 29 此节可以在内存中共享
    - **30 此节可以作为代码执行**
    - **31 此节可读**
    - **32 此节可写**

## 数据区
有一些 PE 文件格式相关的结构体不在 PE 头部，而是分散在各个数据节中，位置由 `IMAGE_OPTIONAL_HEADER.DataDirtory` 数组给出
保存了导出表、导入表、重定位表等结构

### 导出表
- 数据目录第 **一** 项
- 导出表即导出函数表，调用的 API 函数是由 DLL 文件导出的函数
- 通常导出表只存在于 DLL 文件

#### 导出函数
##### 导出函数的定义
1. 直接在函数定义时导出
2. 通过定义 `.def` 文件导出

##### 导出函数的调用
1. 隐式调用，程序编译时生成导入表
2. 显示调用，通过 *LoadLibrary* 函数和 *GetProcAddress* 函数调用

#### 结构体 IMAGE_EXPORT_DIRECTORY
```C
typedef struct _IMAGE_EXPORT_DIRECTORY {
    DWORD   Characteristics;       // 保留值，必须0
    DWORD   TimeDateStamp;         // 时间戳
    WORD    MajorVersion;          // 主版本号，默认0
    WORD    MinorVersion;          // 次版本号，默认0
    DWORD   Name;                  // PE文件的名称
    DWORD   Base;                  // 序号基数
    DWORD   NumberOfFunctions;     // 导出函数的数量
    DWORD   NumberOfNames;         // 以函数名称导出的函数的数量
    DWORD   AddressOfFunctions;    // 导出函数地址表的RVA
    DWORD   AddressOfNames;        // 导出名称指针表的RVA
    DWORD   AddressOfNameOrdinals; // 序号表的RVA
} IMAGE_EXPORT_DIRECTORY, *PIMAGE_EXPORT_DIRECTORY;
```

#### 字段解析
1. `TimeDateStamp`：绑定导入表的时间戳会和 DLL 的时间戳对比，不相同则不生效
2. `Name`：指向该文件名 ASCII 码字符串的 RVA
3. `Base`：映像中导出符号的起始序数值，指定导出地址表的起始序数值，通常为 1
4. `AddressOfNames`：保存导出名称指针表的 RVA，该表数量是 `NumberOfNames` 的值
5. `AddressOfNameOrdinals`：导出序数表的 RVA，该表数量是 `NumberOfNames` 的值。此处的值是索引值，加上 `Base` 才是真正的序号

### 导入表
- 数据目录第 **二** 项
- 在 PE 文件运行时，需要别的 PE 文件给予的支持。因此导入表存储的是从其他文件导入过来的函数名，序号。在加载到内存之后，会存储这些函数的地址
- 由于一个 PE 文件可能会需要多个 PE 文件的支持，所以导入表结构一般有多个，即导入表是一个 **结构体数组** ，以一个全零元素为结尾，每一个数组的元素，代表一个 PE 文件的导入信息

#### 绑定导入表
- 使用绑定导入表中的地址，需要有两个前提
    1. 装载地址与 `IMAGE_OPTIONAL_HEADER.ImageBase` 相同
    2. DLL 提供的函数地址没有变化
- 结构体定义
    ```C
    typedef struct _IMAGE_BOUND_IMPORT_DESCRIPTOR {
        WORD    TimeDateStamp;
        WORD    OffsetMosuleName;
        WORD    NumberOfModuleForwarderRefs;
    } IMAGE_BOUND_IMPORT_DESCRIPTOR, *PIMAGE_BOUND_IMPORT_DESCRIPTOR;
    ```
- 字段解析
    1. `OffsetMosuleName`：绑定模块的名称，该值是一个以第一个 *IMAGE_BOUND_IMPORT_DESCRIPTOR* 为起始地址的偏移
    2. `NumberOfModuleForwarderRefs`：
- PE 文件装载时，Windows 需要根据导入表的模块名称和函数名称装载相应模块，得到导入函数的地址并填充导入地址表，绑定地址表则直接将导入函数写入 PE 文件

#### 结构体 IMAGE_IMPORT_DESCRIPTOR
```C
typedef struct _IMAGE_IMPORT_DESCRIPTOR {
    union {
        DWORD   Characteristics;
        DWORD   OriginalFirstThunk; // 指向一个 INT 的相对虚拟地址 RVA
    } DUMMYUNIONNAME;
    DWORD   TimeDateStamp;          // 时间标志
    DWORD   ForwarderChain;         // 转发机制用到
    DWORD   Name;                   // 导入的PE文件的名字的相对虚拟地址RVA
    DWORD   FirstThunk;             // IAT，指向一个结构体数组 RVA
} IMAGE_IMPORT_DESCRIPTOR， *PIMAGE_IMPORT_DESCRIPTOR;
```

#### 字段解析
1. `OriginalFirstThunk`：保存了指向导入函数名称（序号）的 RVA 表，该表是一个 `IMAGE_THUNK_DATA` 结构体，定义如下
    ```C
    typedef struct _IMAGE_THUNK_DATA32 {
        union {
            DWORD ForwarderString;
            DWORD Function;       //导入函数的地址
            DWORD Ordinal;
            DWORD AddressOfData;
        } u1;
      } IMAGE_THUNK_DATA32;
    ```
    - 该结构体分 **32位** 和 **64位** 版本
    - union 四个字段占用相同空间
        1. `Ordinal`：导入函数的序号，*IMAGE_THUNK_DATA* 最高位为 1 时有效
        2. `AddressOfData`：指向 *IMAGE_IMPORT_BY_NAME* 结构体的 RVA，当 *IMAGE_THUNK_DATA* 最高位不为 1 时有效
            > IMAGE_IMPORT_BY_NAME 结构体定义如下
            ```C
            typedef struct _IMAGE_IMPORT_BY_NAME {
                WORD    Hint;
                CHAR   Name[1]; // 表示导入函数名称，ASCII 码，以 NULL 结尾，长度 1 字节
            } IMAGE_IMPORT_BY_NAME, *PIMAGE_IMPORT_BY_NAME;
            ```
            > *IMAGE_IMPORT_BY_NAME* 结构体可以了解导入函数是通过 **序号** 还是 **名称** 导入；
            > - 序号导入，则序号可以在 *IMAGE_THUNK_DATA* 中获得
            > - 名称导入，则借助 *IMAGE_IMPORT_BY_NAME* 得到导入函数名称
2. `FirstThunk`：装载内存前，保存了指向导入地址表的 RVA 表，与 `OriginalFirstThunk` 相同，装载内存后则写入 **导入函数的实际地址**

### 重定位表
建议装载地址：`IMAGE_OPTIONAL_HEADER.ImageBase` 字段是建议装载地址

- 数据目录第 **六** 项
- 通过第五项进行定位，下标从 0 开始，索引定位如下
    ```C
    #define IMAGE_DIRECTORY_ENTRY_BASERELOC 5 // Base Relocation Table
    ```
- 重定位表由多个 *IMAGE_BASE_RELOCATION* 组合而成，且以一个全 0 的结构体结束
- 重定位地址修正：**实际装载地址** 减去 **建议装载地址**，用得出的 **差值** 加上用建议装载地址得出的装载地址

#### 结构体 IMAGE_BASE_RELOCATION
```C
typedef struct _IMAGE_BASE_RELOCATION {
    DWORD   VirtualAddress; // 重定位数据的 RVA
    DWORD   SizeOfBlock;    // 结构体的大小
    WORD    TypeOffset[1];  // 偏移
} IMAGE_BASE_RELOCATION;
```

#### 字段解析
1. `SizeOfBlock`：当前区段重定位结构的大小，包括重定位数据，*IMAGE_BASE_RELOCATION* 结构体大小是 8 字节，即该值 `8 BYTE + n * WORD`
2. `TypeOffset`：高 4 位表示类型，低 12 位表示区段内需要重定位的 RVA 值
    - `TypeOffset` 类型取值定义如下
        ```C
        #define IMAGE_REL_BASED_ABSOLUTE        0
        #define IMAGE_REL_BASED_HIGH            1
        #define IMAGE_REL_BASED_LOW             2
        #define IMAGE_REL_BASED_HIGHLOW         3
        #define IMAGE_REL_BASED_HIGHADJ         4
        #define IMAGE_REL_BASED_MIPS_JMPADDR    5
        #define IMAGE_REL_BASED_MIPS_JMPADDR    9
        #define IMAGE_REL_BASED_IA64_IMM64      9
        #define IMAGE_REL_BASED_DIR64           10
        ```
    - Win32 下，所有重定位类型都是 *IMAGE_REL_BASED_HIGHLOW*
    - `TypeOffset` 的数量：整个区段重定位结构的大小(`SizeOfBlock`)减去 8 字节，再除以 2 (`BYTE`)

