# Walkthrough

### 1. Automated Tests Output
We executed the automated unit test suite `test_system.js` locally and verified all assertions passed:

```
Running HemoVault AI System Verification Tests...

[✓] Test CBC Anemia detection passed.
[✓] Test Lipid Hypercholesterolemia detection passed.
[✓] Test Perfect Health Score evaluation passed.
[✓] Test Inverse Parameter Logic (HDL Low) passed.

Ran 4 tests in 0.001s

OK
Success: All local clinical validation checks passed successfully.
```

The tests validated:
- `test_cbc_anemia`: The local AI diagnostic engine correctly flags Low Hemoglobin and Low RBC, triggering anemia warnings.
- `test_lipid_critical`: Verified that extreme cholesterol elevations (30%+ over range limit) are successfully upgraded to `Critical` status and generate heart-health diet guidelines.
- `test_perfect_score`: Confirmed that patient health score starts at 100/100 and no deductions are made if parameters fall in standard intervals.
- `test_inverse_logic`: HDL is verified to trigger `Low` status if under the minimum limit (reversing standard low/high boundaries, as high HDL is protective).

---

### How to Launch and Verify Locally

1. Launch the server in your terminal:
   ```bash
   docker-compose up --build
   ```
2. Seed the local MongoDB database with mock profiles and pre-compiled PDFs:
   ```bash
   docker exec -it hemovault_backend npm run seed
   ```
3. Open http://127.0.0.1:5173 in your web browser.
4. Test prompts by logging in with seeded profiles (e.g. `patient@hemovault.com`, `doctor@hemovault.com`, `lab@hemovault.com` using password `password123`).

---

### Windows localhost vs 127.0.0.1 Note

On Windows, the name `localhost` often resolves to the IPv6 address (`[::1]`). Since Node.js/Vite server bindings by default map strictly to the IPv4 loopback (`127.0.0.1`), a browser's attempt to connect via IPv6 can fail with a connection error. 

**The Solution**:
Navigate explicitly using the IPv4 loopback address in your browser address bar:
👉 **[http://127.0.0.1:5173](http://127.0.0.1:5173)**
This bypasses Windows' IPv6 resolution mapping and loads the HemoVault AI glassmorphic dashboard immediately.
