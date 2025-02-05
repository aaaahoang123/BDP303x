# Trả lời câu hỏi Lab 6

## 1. Để chạy được truffle test, cần thực hiện những bước nào.
- B1: Start ganache bằng lệnh: ganache.
- B2: Chỉnh sửa file truffle-config.js: 

```javascript
{
    development: {
        host: "127.0.0.1", // Localhost (default: none)
        port: 8545, // Standard Ethereum port (default: none)
        network_id: "*", // Any network (default: none)
    },
}
```

Do source code gốc sử dụng port 7545 không đúng port mặc định của ganache.

- B3: Chỉnh sửa contract SupplyChain.sol

```solidity
// Bỏ đoạn code
contract SupplyChain {
    constructor() {}
}

// Sửa tên contract bên dưới từ supplyChain thành SupplyChain
```

- B4: Run `truffle test`

## 2. Mô tả lại bằng lời, 2 test case được cung cấp sẵn.
- Test case 1: Kiểm thử tạo bên tham gia
  - B1: tạo một bên tham gia đầu tiên với thông tin: tên: 'A' - password: 'passA', address: '0x8858d98eC700363a2A1D9308c7312653d186f9B0', type: Manufacturer
  - B2: Kiểm thư các thông tin tên và type của participant có id = 0 xem có khớp với thông tin đã nhập vào không.
  - B3: tạo một bên tham gia đầu tiên với thông tin: tên: 'B' - password: 'passB', address: '0xd295d0BF5Fb583219CB7b8AB1a3F3f5E218D0442', type: Supplier
  - B4: Kiểm thư các thông tin tên và type của participant có id = 1 xem có khớp với thông tin đã nhập vào không.
  - B5: tạo một bên tham gia đầu tiên với thông tin: tên: 'C' - password: 'passC', address: '0x9c4c246bca58D3b821bFFdbdB88D60E8E2727E84', type: Consumer
  - B6: Kiểm thư các thông tin tên và type của participant có id = 2 xem có khớp với thông tin đã nhập vào không.

- Test case 2: Kiểm thử tính năng lấy thông tin bên tham gia.
  - B1: Lấy thông tin participant có id = 0 bằng hàm getParticipant(), sau đó kiểm thử giá trị username xem có khớp thông tin đã tạo bên trên không.
  - B2: Lấy thông tin participant có id = 1 bằng hàm getParticipant(), sau đó kiểm thử giá trị username xem có khớp thông tin đã tạo bên trên không.
  - B3: Lấy thông tin participant có id = 2 bằng hàm getParticipant(), sau đó kiểm thử giá trị username xem có khớp thông tin đã tạo bên trên không.