using System;
using System.ComponentModel;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Threading.Tasks;

[Flags]
public enum OdenConstraints : int
{
    None = 0,
    NoStdin = 1,
    NoStdout = 2,
    NoStderr = 4
}

public class OdenWinRunner
{
    private const int STD_INPUT_HANDLE = -10;
    private const int STD_OUTPUT_HANDLE = -11;
    private const int STD_ERROR_HANDLE = -12;

    private const int FILE_NOT_FOUND = 2;
    private const int WAIT_TIMEOUT = 258;

    [DllImport("kernel32.dll")]
    private static extern void SetStdHandle(int nStdHandle, IntPtr handle);

    /// <summary>
    /// Runs Oden.exe under the specified constraints
    /// </summary>
    /// <param name="pathToOdenExe">Path to the Oden.exe file. Can be absolute or relative</param>
    /// <param name="pathToTestScript">Path to the script file Oden should run.</param>
    /// <param name="constraints">The constraints to apply to the Oden process</param>
    /// <param name="timeoutMilliseconds">How long to wait for the Oden process to exit</param>
    /// <returns>The oden.exe exit code, or an exit code provided by the test runner</returns>
    public static int RunOdenScript(string pathToOdenExe, string pathToTestScript, OdenConstraints constraints, uint timeoutMilliseconds = 1000)
    {
        try
        {
            if (!File.Exists(pathToOdenExe))
            {
                Console.Error.WriteLine("Cannot find Oden.exe at " + pathToOdenExe);
                return FILE_NOT_FOUND;
            }

            if (!File.Exists(pathToTestScript))
            {
                Console.Error.WriteLine("Cannot find test script at " + pathToTestScript);
                return FILE_NOT_FOUND;
            }

            ProcessStartInfo startInfo = new ProcessStartInfo(pathToOdenExe)
            {
                ErrorDialog = false,
                UseShellExecute = false,
                Arguments = @"run -A " + pathToTestScript,
                RedirectStandardInput = !constraints.HasFlag(OdenConstraints.NoStdin),
                RedirectStandardOutput = !constraints.HasFlag(OdenConstraints.NoStdout),
                RedirectStandardError = !constraints.HasFlag(OdenConstraints.NoStderr)
            };

            startInfo.Environment.Add("RUST_BACKTRACE", "1");

            if (constraints.HasFlag(OdenConstraints.NoStdin))
            {
                SetStdHandle(STD_INPUT_HANDLE, (IntPtr)null);
            }

            if (constraints.HasFlag(OdenConstraints.NoStdout))
            {
                SetStdHandle(STD_OUTPUT_HANDLE, (IntPtr)null);
            }

            if (constraints.HasFlag(OdenConstraints.NoStderr))
            {
                SetStdHandle(STD_ERROR_HANDLE, (IntPtr)null);
            }

            Process process = new Process { StartInfo = startInfo };
            process.Start();

            Task<string> stdErrTask = startInfo.RedirectStandardError ?
                process.StandardError.ReadToEndAsync() : Task.FromResult<string>(null);
            Task<string> stdOutTask = startInfo.RedirectStandardOutput ?
                process.StandardOutput.ReadToEndAsync() : Task.FromResult<string>(null);

            if (!process.WaitForExit((int)timeoutMilliseconds))
            {
                Console.Error.WriteLine("Timed out waiting for Oden process to exit");
                try
                {
                    process.Kill();
                }
                catch
                {
                    // Kill might fail, either because the process already exited or due to some other error
                    Console.Error.WriteLine("Failure killing the Oden process - possible Zombie Oden.exe process");
                }
                return WAIT_TIMEOUT;
            }

            // If the Oden process wrote to STDERR - append it to our STDERR
            if (!constraints.HasFlag(OdenConstraints.NoStderr))
            {
                string error = stdErrTask.Result;
                if (!string.IsNullOrWhiteSpace(error))
                {
                    Console.Error.WriteLine(error);
                }
            }

            return process.ExitCode;

        }
        catch (Win32Exception ex)
        {
            Console.Error.WriteLine("Win32Exception: code = " + ex.ErrorCode + ", message: " + ex.Message);
            return ex.NativeErrorCode;
        }
        catch (Exception ex)
        {
            Console.Error.WriteLine("Exception: message: " + ex.Message);
            return -1;
        }
    }
}
