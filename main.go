package main

import (
	"github.com/dworthen/scf/internal/cmd"
	"github.com/mailgun/raymond/v2"
)

func main() {

	raymond.RegisterHelper("tif", func(values ...interface{}) string {
		if len(values) == 0 {
			return ""
		}
		truthy := raymond.IsTrue(values[0])

		truthyIndex := 1
		falsyIndex := 2

		if len(values) <= 2 {
			falsyIndex = 0
		}
		if len(values) == 1 {
			truthyIndex = 0
		}

		if truthy {
			return raymond.Str(values[truthyIndex])
		} else if falsyIndex != 0 {
			return raymond.Str(values[falsyIndex])
		}

		return ""
	})

	raymond.RegisterHelper("ntif", func(values ...interface{}) string {
		if len(values) == 0 {
			return ""
		}
		truthy := !raymond.IsTrue(values[0])

		truthyIndex := 1
		falsyIndex := 2

		if len(values) <= 2 {
			falsyIndex = 0
		}
		if len(values) == 1 {
			truthyIndex = 0
		}

		if truthy {
			return raymond.Str(values[truthyIndex])
		} else if falsyIndex != 0 {
			return raymond.Str(values[falsyIndex])
		}

		return ""
	})

	raymond.RegisterHelper("bool", func(value interface{}) bool {
		return raymond.IsTrue(value)
	})

	raymond.RegisterHelper("not", func(value interface{}) bool {
		return !raymond.IsTrue(value)
	})

	//coment
	raymond.RegisterHelper("eq", func(a interface{}, b interface{}) bool {
		aVal := raymond.Str(a)
		bVal := raymond.Str(b)

		return aVal == bVal
	})

	cmd.Execute()
}
