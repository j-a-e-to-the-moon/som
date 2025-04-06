using System;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using SomApp.Data;
using SomApp.Models;
using SomApp.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace SomApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly JwtService _jwtService;

        public AuthController(ApplicationDbContext context, JwtService jwtService)
        {
            _context = context;
            _jwtService = jwtService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(UserRegisterDto registerDto)
        {
            // 사용자명 중복 체크
            if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username))
            {
                return BadRequest("Username is already taken");
            }

            // 이메일 중복 체크
            if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
            {
                return BadRequest("Email is already registered");
            }

            // 비밀번호 해싱
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(registerDto.Password));
            var passwordHash = Convert.ToBase64String(hashedBytes);

            // 새 사용자 생성
            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                PasswordHash = passwordHash,
                CreatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new 
            { 
                message = "User registered successfully",
                token = _jwtService.GenerateToken(user)
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(UserLoginDto loginDto)
        {
            // 사용자 찾기
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == loginDto.Username);
            if (user == null)
            {
                return Unauthorized("Invalid username or password");
            }

            // 비밀번호 확인
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(loginDto.Password));
            var passwordHash = Convert.ToBase64String(hashedBytes);

            if (user.PasswordHash != passwordHash)
            {
                return Unauthorized("Invalid username or password");
            }

            // JWT 토큰 생성
            var token = _jwtService.GenerateToken(user);

            return Ok(new 
            { 
                token,
                user = new 
                { 
                    id = user.Id,
                    username = user.Username,
                    email = user.Email
                }
            });
        }
    }
}